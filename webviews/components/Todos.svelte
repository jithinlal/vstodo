<script lang="ts">
	import { onMount } from 'svelte';
	import type { User } from '../types';
	let text = '';
	let todos: Array<{ id: number; text: string; completed: boolean }> = [];
	export let user: User;
	export let accessToken: string;

	async function addTodo(t: string) {
		const response = await fetch(`${apiBaseUrl}/todo`, {
			method: 'POST',
			body: JSON.stringify({
				text: t,
			}),
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${accessToken}`,
			},
		});
		text = '';
		const { todo } = await response.json();
		todos = [todo, ...todos];
	}

	onMount(async () => {
		window.addEventListener('message', async (event) => {
			const message = event.data;
			switch (message.type) {
				case 'new-todo':
					addTodo(message.value);
					break;
			}
		});

		const response = await fetch(`${apiBaseUrl}/todo`, {
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		});
		const payload = await response.json();
		todos = payload.todos;
	});
</script>

<div>
	Hello {user.name ?? ''}
</div>

<form
	on:submit={async (e) => {
		e.preventDefault();
		addTodo(text);
	}}
>
	<input bind:value={text} />
</form>

<ul>
	{#each todos as todo (todo.id)}
		<li
			class={todo.completed ? 'complete' : ''}
			on:click={async () => {
				todo.completed = !todo.completed;
				await fetch(`${apiBaseUrl}/todo`, {
					method: 'PUT',
					body: JSON.stringify({
						id: todo.id,
					}),
					headers: {
						'content-type': 'application/json',
						authorization: `Bearer ${accessToken}`,
					},
				});
			}}
		>
			{todo.text}
		</li>
	{/each}
</ul>

<style>
	.complete {
		text-decoration: line-through;
	}
</style>
