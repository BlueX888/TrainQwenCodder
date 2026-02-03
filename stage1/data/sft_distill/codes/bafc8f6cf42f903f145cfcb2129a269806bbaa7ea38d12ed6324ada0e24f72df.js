const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let rotationCount = 0;  // 旋转次数
let currentRotation = 0;  // 当前旋转角度（度）
let statusText;
let cursors;
let lastKeyPressed = null;
let isRotating = false;

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制参考网格
  const graphics = this.add.graphics();
  
  // 绘制网格线
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心十字标记
  graphics.lineStyle(3, 0xff0000, 1);
  graphics.lineBetween(400, 280, 400, 320);
  graphics.lineBetween(380, 300, 420, 300);
  
  // 绘制一些彩色方块作为旋转参考
  const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    const x = 400 + Math.cos(angle) * 200;
    const y = 300 + Math.sin(angle) * 150;
    
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(x - 30, y - 30, 60, 60);
    
    // 添加文字标记
    this.add.text(x, y, `Box ${i + 1}`, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }
  
  // 添加标题文字
  this.add.text(400, 50, 'Camera Rotation Effect', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 添加说明文字
  this.add.text(400, 100, 'Press Arrow Keys to Rotate Camera', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  this.add.text(400, 130, 'LEFT: -90° | RIGHT: +90° | UP: Reset | DOWN: 180°', {
    fontSize: '14px',
    color: '#888888'
  }).setOrigin(0.5);
  
  // 状态显示文字
  statusText = this.add.text(400, 550, '', {
    fontSize: '20px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);
  
  updateStatusText();
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 监听方向键
  this.input.keyboard.on('keydown-LEFT', () => {
    if (!isRotating) {
      isRotating = true;
      lastKeyPressed = 'LEFT';
      currentRotation -= 90;
      rotationCount++;
      
      // 旋转到目标角度（逆时针90度）
      camera.rotateTo(Phaser.Math.DegToRad(currentRotation), false, 1500, 'Sine.easeInOut', false, (cam, progress) => {
        if (progress === 1) {
          isRotating = false;
        }
      });
      
      updateStatusText();
    }
  });
  
  this.input.keyboard.on('keydown-RIGHT', () => {
    if (!isRotating) {
      isRotating = true;
      lastKeyPressed = 'RIGHT';
      currentRotation += 90;
      rotationCount++;
      
      // 旋转到目标角度（顺时针90度）
      camera.rotateTo(Phaser.Math.DegToRad(currentRotation), false, 1500, 'Sine.easeInOut', false, (cam, progress) => {
        if (progress === 1) {
          isRotating = false;
        }
      });
      
      updateStatusText();
    }
  });
  
  this.input.keyboard.on('keydown-UP', () => {
    if (!isRotating) {
      isRotating = true;
      lastKeyPressed = 'UP';
      currentRotation = 0;
      rotationCount++;
      
      // 重置旋转
      camera.rotateTo(0, false, 1500, 'Sine.easeInOut', false, (cam, progress) => {
        if (progress === 1) {
          isRotating = false;
        }
      });
      
      updateStatusText();
    }
  });
  
  this.input.keyboard.on('keydown-DOWN', () => {
    if (!isRotating) {
      isRotating = true;
      lastKeyPressed = 'DOWN';
      currentRotation += 180;
      rotationCount++;
      
      // 旋转180度
      camera.rotateTo(Phaser.Math.DegToRad(currentRotation), false, 1500, 'Sine.easeInOut', false, (cam, progress) => {
        if (progress === 1) {
          isRotating = false;
        }
      });
      
      updateStatusText();
    }
  });
}

function update() {
  // 可以在这里添加实时更新逻辑
}

function updateStatusText() {
  const normalizedRotation = ((currentRotation % 360) + 360) % 360;
  statusText.setText(
    `Rotation Count: ${rotationCount} | ` +
    `Current Angle: ${normalizedRotation}° | ` +
    `Last Key: ${lastKeyPressed || 'None'} | ` +
    `Status: ${isRotating ? 'ROTATING...' : 'IDLE'}`
  );
}

new Phaser.Game(config);