import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MindsetService } from "./mindset.service";
import { TakeSelfTestDto } from "./dto/take-self-test.dto";

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller("mindset")
@UseGuards(JwtAuthGuard)
export class MindsetController {
  constructor(private mindsetService: MindsetService) {}

  @Post("self-test")
  async takeSelfTest(
    @Request() req: RequestWithUser,
    @Body() testDto: TakeSelfTestDto,
  ) {
    return this.mindsetService.takeSelfTest(req.user.id, testDto);
  }

  @Get("self-test/history")
  async getTestHistory(@Request() req: RequestWithUser) {
    return this.mindsetService.getUserTestHistory(req.user.id);
  }

  @Get("self-test/can-take")
  async canTakeTest(@Request() req: RequestWithUser) {
    const result = await this.mindsetService.canTakeTest(req.user.id);
    return {
      canTake: result.canTake,
      nextAvailableDate: result.nextAvailableDate?.toISOString(),
    };
  }
}
