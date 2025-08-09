import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  RefreshCw
} from "lucide-react";

interface ImportStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export default function CSVImportWizard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  
  const steps: ImportStep[] = [
    {
      id: 1,
      title: "Upload CSV File",
      description: "Select your hotel data CSV file",
      completed: currentStep > 1,
      active: currentStep === 1
    },
    {
      id: 2,
      title: "Map Fields",
      description: "Match CSV columns to hotel fields",
      completed: currentStep > 2,
      active: currentStep === 2
    },
    {
      id: 3,
      title: "Validate Data",
      description: "Check for errors and conflicts",
      completed: currentStep > 3,
      active: currentStep === 3
    },
    {
      id: 4,
      title: "Import Data",
      description: "Complete the import process",
      completed: currentStep > 4,
      active: currentStep === 4
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      setImportData(data);
      setCurrentStep(2);
      
      toast({
        title: "File Uploaded",
        description: `Found ${data.length} records to import`,
      });
    };
    
    reader.readAsText(file);
  };

  const validateData = () => {
    const errors: string[] = [];
    const requiredFields = ['name', 'email', 'phone'];
    
    importData.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${index + 1}: Missing ${field}`);
        }
      });
      
      // Email validation
      if (row.email && !row.email.includes('@')) {
        errors.push(`Row ${index + 1}: Invalid email format`);
      }
    });
    
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      toast({
        title: "Validation Passed",
        description: "All data is valid and ready for import",
      });
      setCurrentStep(4);
    } else {
      toast({
        title: "Validation Failed",
        description: `Found ${errors.length} errors that need to be fixed`,
        variant: "destructive",
      });
    }
    
    setCurrentStep(3);
  };

  const executeImport = async () => {
    setImporting(true);
    
    try {
      // Simulate import process
      for (let i = 0; i < importData.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        // Here you would call the actual import API
      }
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importData.length} records`,
      });
      
      setCurrentStep(5);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during import",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,email,phone,role,hotel_name,address
"John Doe","john@example.com","+234123456789","FRONT_DESK","Luxury Hotel Lagos","Victoria Island"
"Jane Smith","jane@example.com","+234987654321","HOUSEKEEPING","Luxury Hotel Lagos","Victoria Island"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotel_staff_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span>CSV Import Wizard</span>
          </CardTitle>
          <p className="text-gray-600">
            Bulk import hotel staff, rooms, and guest data from CSV files
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.completed ? 'bg-green-500 border-green-500 text-white' :
                  step.active ? 'bg-blue-500 border-blue-500 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {steps.find(s => s.active)?.title}
            </h3>
            <p className="text-gray-600">
              {steps.find(s => s.active)?.description}
            </p>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload CSV File</p>
                  <p className="text-gray-600">Choose a CSV file to import hotel data</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                    data-testid="input-csv-upload"
                  />
                  <label 
                    htmlFor="csv-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    data-testid="button-upload-csv"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Need a template?</p>
                    <p className="text-blue-700 text-sm">Download our CSV template to ensure proper formatting.</p>
                    <Button 
                      variant="link" 
                      onClick={downloadTemplate}
                      className="p-0 text-blue-600 mt-2"
                      data-testid="button-download-template"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && uploadedFile && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>File:</strong> {uploadedFile.name}</p>
                <p><strong>Records:</strong> {importData.length}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Preview Data</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(importData[0] || {}).map(key => (
                          <th key={key} className="px-4 py-2 text-left border-b">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importData.length > 5 && (
                  <p className="text-sm text-gray-600">Showing first 5 of {importData.length} records</p>
                )}
              </div>
              
              <Button onClick={validateData} data-testid="button-validate-data">
                Validate Data
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                validationErrors.length === 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {validationErrors.length === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`font-medium ${
                    validationErrors.length === 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationErrors.length === 0 ? 'Validation Passed' : 'Validation Failed'}
                  </p>
                </div>
                
                {validationErrors.length > 0 && (
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {validationErrors.length > 10 && (
                      <li>• ... and {validationErrors.length - 10} more errors</li>
                    )}
                  </ul>
                )}
              </div>
              
              {validationErrors.length === 0 && (
                <Button onClick={() => setCurrentStep(4)} data-testid="button-proceed-import">
                  Proceed to Import
                </Button>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Ready to Import</p>
                    <p className="text-yellow-700 text-sm">
                      {importData.length} records will be imported. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              {importing && (
                <div className="space-y-2">
                  <Progress value={(currentStep / 4) * 100} />
                  <p className="text-sm text-gray-600 flex items-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Importing records...
                  </p>
                </div>
              )}
              
              <Button 
                onClick={executeImport}
                disabled={importing}
                data-testid="button-execute-import"
              >
                {importing ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}