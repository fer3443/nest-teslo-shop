import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
  (data:string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user)
      throw new InternalServerErrorException('User not found (req)')
    // if(data){
    //   const userProp = req.user[data]
    //   return userProp
    // }
    return !data ? user : user[data]
  }
)