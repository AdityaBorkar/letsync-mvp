import type { Context } from "../config.js"

export function getData_POLL(__: Request, _: Context) {
  // const isAnonymous = session?.user?.isAnonymous;
  // if (isAnonymous) {
  // 	return NextResponse.json({ message: 'Anonymous user' });
  // }

  // const params = new URL(request.url).searchParams;
  // const _cursor = params.get("cursor");
  // const _lastUpdatedAt = params.get("lastUpdatedAt");

  // const data = await db
  // 	.select()
  // 	.from(clientLocalChanges)
  // 	.where(eq(clientLocalChanges.userId, userId));

  return Response.json({ message: "Hello, world!" })
  // try {
  // 	// Authenticate the request
  // 	const session = await auth.api.getSession({
  // 		headers: request.headers,
  // 	});
  // 	if (!session?.user) {
  // 		return NextResponse.json(
  // 			{ error: 'Authentication required' },
  // 			{ status: 401 },
  // 		);
  // 	}
  // 	const userId = session.user.id;
  // 	const { searchParams } = new URL(request.url);
  // 	const lastSyncParam = searchParams.get('lastSync');
  // 	const lastSyncTimestamp = lastSyncParam
  // 		? new Date(lastSyncParam)
  // 		: new Date(0);
  // 	// Security: Only sync data for the authenticated user
  // 	const baseCondition = eq(folders.userId, userId);
  // 	const syncCondition = and(
  // 		baseCondition,
  // 		gt(folders.updatedAt, lastSyncTimestamp),
  // 	);
  // 	// Fetch user's data with incremental sync support
  // 	const [
  // 		userFolders,
  // 		userConversations,
  // 		userMessages,
  // 		userApiKeys,
  // 		userPrompts,
  // 		userPersonas,
  // 	] = await Promise.all([
  // 		// Folders
  // 		db
  // 			.select()
  // 			.from(folders)
  // 			.where(syncCondition),
  // 		// Conversations
  // 		db
  // 			.select()
  // 			.from(conversations)
  // 			.where(
  // 				and(
  // 					eq(conversations.userId, userId),
  // 					gt(conversations.updatedAt, lastSyncTimestamp),
  // 				),
  // 			),
  // 		// Messages - only for conversations belonging to the user
  // 		db
  // 			.select({
  // 				attachments: messages.attachments,
  // 				content: messages.content,
  // 				conversationId: messages.conversationId,
  // 				createdAt: messages.createdAt,
  // 				id: messages.id,
  // 				metadata: messages.metadata,
  // 				parentMessageId: messages.parentMessageId,
  // 				role: messages.role,
  // 				updatedAt: messages.updatedAt,
  // 			})
  // 			.from(messages)
  // 			.innerJoin(conversations, eq(messages.conversationId, conversations.id))
  // 			.where(
  // 				and(
  // 					eq(conversations.userId, userId),
  // 					gt(messages.updatedAt, lastSyncTimestamp),
  // 				),
  // 			),
  // 		// API Keys (exclude the actual key hash for security)
  // 		db
  // 			.select({
  // 				createdAt: apiKeys.createdAt,
  // 				id: apiKeys.id,
  // 				isActive: apiKeys.isActive,
  // 				lastUsed: apiKeys.lastUsed,
  // 				name: apiKeys.name,
  // 				provider: apiKeys.provider,
  // 				updatedAt: apiKeys.updatedAt,
  // 				userId: apiKeys.userId,
  // 			})
  // 			.from(apiKeys)
  // 			.where(
  // 				and(
  // 					eq(apiKeys.userId, userId),
  // 					gt(apiKeys.updatedAt, lastSyncTimestamp),
  // 				),
  // 			),
  // 		// Prompts
  // 		db
  // 			.select()
  // 			.from(prompts)
  // 			.where(
  // 				and(
  // 					eq(prompts.userId, userId),
  // 					gt(prompts.updatedAt, lastSyncTimestamp),
  // 				),
  // 			),
  // 		// Personas
  // 		db
  // 			.select()
  // 			.from(personas)
  // 			.where(
  // 				and(
  // 					eq(personas.userId, userId),
  // 					gt(personas.updatedAt, lastSyncTimestamp),
  // 				),
  // 			),
  // 	]);
  // 	// Prepare sync response
  // 	const syncData = {
  // 		data: {
  // 			apiKeys: userApiKeys,
  // 			conversations: userConversations,
  // 			folders: userFolders,
  // 			messages: userMessages,
  // 			personas: userPersonas,
  // 			prompts: userPrompts,
  // 		},
  // 		lastSyncTimestamp: new Date().toISOString(),
  // 		recordCounts: {
  // 			apiKeys: userApiKeys.length,
  // 			conversations: userConversations.length,
  // 			folders: userFolders.length,
  // 			messages: userMessages.length,
  // 			personas: userPersonas.length,
  // 			prompts: userPrompts.length,
  // 		},
  // 		userId,
  // 	};
  // 	// Log sync activity (for monitoring)
  // 	console.log(
  // 		`Data sync for user ${userId}: ${JSON.stringify(syncData.recordCounts)}`,
  // 	);
  // 	return NextResponse.json(syncData);
  // } catch (error) {
  // 	console.error('Data sync endpoint error:', error);
  // 	return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
  // }
}
