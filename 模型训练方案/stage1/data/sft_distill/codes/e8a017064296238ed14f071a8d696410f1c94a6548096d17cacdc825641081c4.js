// 完整的 Phaser3 相机旋转效果代码
class CameraRotateScene extends Phaser.Scene {
  constructor() {
    super('CameraRotateScene');
    this.rotateCount = 0;
    this.isRotating = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      rotateCount: 0,
      isRotating: false,
      lastRotateTime: 0
    };

    // 创建背景网格作为参考
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    
    // 绘制网格
    for (let x = 0; x <= 800; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    graphics.strokePath();

    // 绘制中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 20);
    
    // 绘制方向指示器
    const directionGraphics = this.add.graphics();
    directionGraphics.fillStyle(0xffff00, 1);
    directionGraphics.fillRect(380, 100, 40, 150);

    // 添加文本提示
    this.instructionText = this.add.text(400, 50, 'Click Left Mouse Button to Rotate Camera', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(400, 550, 'Rotate Count: 0 | Status: Idle', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键（button === 0）
      if (pointer.leftButtonDown()) {
        this.triggerCameraRotate();
      }
    });

    // 监听相机旋转完成事件
    this.mainCamera.on('camerarotatecomplete', () => {
      this.isRotating = false;
      window.__signals__.isRotating = false;
      this.updateStatusText();
      
      console.log(JSON.stringify({
        event: 'rotateComplete',
        rotateCount: this.rotateCount,
        timestamp: Date.now()
      }));
    });
  }

  triggerCameraRotate() {
    // 如果正在旋转，忽略新的触发
    if (this.isRotating) {
      console.log(JSON.stringify({
        event: 'rotateIgnored',
        reason: 'alreadyRotating',
        timestamp: Date.now()
      }));
      return;
    }

    // 更新状态
    this.rotateCount++;
    this.isRotating = true;
    
    // 更新信号
    window.__signals__.rotateCount = this.rotateCount;
    window.__signals__.isRotating = true;
    window.__signals__.lastRotateTime = Date.now();

    // 触发相机旋转效果
    // 每次旋转 360 度（2 * Math.PI 弧度），持续 3000 毫秒
    const targetAngle = this.mainCamera.rotation + Math.PI * 2;
    this.mainCamera.rotateTo(targetAngle, false, 3000, 'Linear', true);

    // 更新状态文本
    this.updateStatusText();

    // 输出日志
    console.log(JSON.stringify({
      event: 'rotateTriggered',
      rotateCount: this.rotateCount,
      targetAngle: targetAngle,
      duration: 3000,
      timestamp: Date.now()
    }));
  }

  updateStatusText() {
    const status = this.isRotating ? 'Rotating...' : 'Idle';
    this.statusText.setText(`Rotate Count: ${this.rotateCount} | Status: ${status}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CameraRotateScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化信号
console.log(JSON.stringify({
  event: 'gameInitialized',
  config: {
    width: config.width,
    height: config.height
  },
  timestamp: Date.now()
}));