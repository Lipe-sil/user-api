import { Queue } from "bullmq";

export class UserQueue {
  private queue = new Queue("emails", {
    connection: {
      host: "redis",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  async sendWelcomeEmail(email: string, name: string) {
    await this.queue.add("send-welcome-email", {
      email,
      name,
    });
  }

  async sendVerificationCode(email: string, code: string) {
    await this.queue.add("send-verification-code", {
      email,
      code: `${process.env.SEND_CODE_URL}/${code}`,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    await this.queue.add("send-reset-password-email", {
      email,
      token,
    });
  }
}
