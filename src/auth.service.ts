// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class BearerAuthGuard implements CanActivate {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers.authorization;
//     if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
//       const token = authHeader.split(' ')[1];
//       const prisma = new PrismaClient();
//       // validate token here
//       const validate = await prisma.apiKey.findUnique({
//         where: {
//           key: token,
//         },
//       });
//       if (validate) {
//         const updateLastUsed = await prisma.apiKey.update({
//           where: {
//             id: validate?.id,
//           },
//           data: {
//             lastUsed: new Date(),
//           },
//         });
//         if (updateLastUsed) {
//           prisma.$disconnect();
//         }
//         return true;
//       }
//       return false;
//     }
//     return false;
//   }
// }
