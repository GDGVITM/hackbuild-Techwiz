declare module "razorpay" {
    interface RazorpayOptions {
      key_id: string;
      key_secret: string;
    }
  
    class Razorpay {
      constructor(options: RazorpayOptions);
      orders: {
        create(params: {
          amount: number;
          currency: string;
          receipt?: string;
          payment_capture?: 0 | 1;
        }): Promise<any>;
      };
    }
  
    export = Razorpay;
  }
  