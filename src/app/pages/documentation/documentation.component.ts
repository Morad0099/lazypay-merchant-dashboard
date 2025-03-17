// documentation.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ApiEndpoint {
  method: string;
  url: string;
  headers?: any;
  payload?: any;
  response?: any;
  params?: any[];
}

interface DocSection {
  title: string;
  content: string;
  subsections?: DocSection[];
  endpoint?: ApiEndpoint;
  banks?: any[];
  responseCode?: any[];
}

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class DocumentationComponent {
  sections: DocSection[] = [
    {
      title: 'Overview',
      content: 'LazyPay is a mobile payment gateway that enables digital payments and collection services across Ghana. The platform supports transactions from all major mobile money providers and bank accounts through payment cards.'
    },
    {
      title: 'Authentication',
      content: 'All API requests require authentication using an API key and merchant ID. These credentials must be included in the request headers.',
      subsections: [
        {
          title: 'Obtaining Credentials',
          content: '1. Create a LazyPay merchant account.\n2. Generate your unique API key and merchant ID from the dashboard.\n3. Store these credentials securely.'
        }
      ]
    },
    {
      title: 'Supported Payment Providers',
      content: '',
      subsections: [
        {
          title: 'Providers',
          content: '• MTN\n• Vodafone\n• AirtelTigo'
        }
      ]
    },
    {
      title: 'USSD Configuration',
      content: 'LazyPay enables merchants to configure their own USSD shortcodes directly through the merchant dashboard. This feature allows customers to make payments using custom USSD codes without requiring any technical integration.',
      subsections: [
        {
          title: 'Setting Up USSD Payments',
          content: '1. Access Wallet Settings\n• Navigate to your merchant dashboard\n• Access the Hub section\n• Click "Update Wallet Details Icon"\n\n2. Configure USSD Settings\n• Enter your USSD shortcode (e.g., *123#)\n• Provide a callback URL for USSD payment notifications\n• Enable USSD Payments using the checkbox\n• Save your configuration by clicking "Update Settings"'
        }
      ]
    },
    {
      title: 'Authentication Token',
      content: 'Generate an authentication token for subsequent API calls.',
      endpoint: {
        method: 'POST',
        url: 'https://doronpay.com/api/hub/token',
        headers: {
          ContentType: 'Application/json'
        },
        payload: {
          apikey: "390925-495q-40",
          merchantId: "4y5e76687957iiytj6",
          operation: "DEBIT"
        },
        response: {
          success: true,
          message: "Token generated successfully",
          data: "argerghstOIOGIRNIONO283985898w9fndsksplgkslmfpstg400KByUBt"
        }
      }
    },
    // ... Continue with other sections including Credit Transaction, Debit Transaction, etc.
    {
      title: 'Supported Banks and Codes',
      content: 'Here are the supported banks and their corresponding codes for transactions:',
      banks: [
        { code: '300302', name: 'STANDARD CHARTERED BANK (GH) LTD' },
        { code: '300303', name: 'ABSA BANK (GH) LTD.' },
        { code: '300304', name: 'GCB BANK' },
        { code: '300305', name: 'NATIONAL INVESTMENT BANK LTD' },
        { code: '300325', name: 'UNITED BANK FOR AFRICA (GH) LTD' },
        { code: '300306', name: 'ARP APEX BANK LTD' },
        { code: '300308', name: 'SG GHANA LTD' },
        { code: '300309', name: 'UNIVERSAL MERCHANT BANK' },
        { code: '300310', name: 'REPUBLIC BANK' },
        { code: '300311', name: 'ZENITH BANK (GH) LTD' },
        { code: '300312', name: 'ECOBANK (GH) LTD' },
        // ... Add all other banks
      ]
    },
    {
      title: 'Response Codes',
      content: 'The following response codes indicate the status of your API requests:',
      responseCode: [
        { code: '00', description: 'Transaction successful. Payment received and processed successfully' },
        { code: '01', description: 'Transaction received for processing' },
        { code: '02', description: 'Transaction failed' }
      ]
    }
  ];

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
}