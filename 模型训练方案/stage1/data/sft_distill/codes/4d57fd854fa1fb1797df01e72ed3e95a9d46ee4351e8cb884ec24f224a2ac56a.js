// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0;
    this.isRotating = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      rotationCount: 0,
      isRotating: false,
      lastRotationTime: 0,
      cameraRotation: 0
    };

    // 创建背景网格作为旋转参考
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(2, 0x00ff00, 0.5);
    for (let x = 0; x <= 800; x += 100) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 100) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制四个角的标记
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(100, 100, 15);
    graphics.fillCircle(700, 100, 15);
    graphics.fillCircle(100, 500, 15);
    graphics.fillCircle(700, 500, 15);

    // 添加文字提示
    const text = this.add.text(400, 50, 'Click to Rotate Camera (3s)', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 550, 'Rotation Count: 0 | Status: Ready', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.triggerCameraRotation();
      }
    });

    console.log('[GameScene] Scene created, waiting for mouse click');
  }

  triggerCameraRotation() {
    // 如果正在旋转，不重复触发
    if (this.isRotating) {
      console.log('[CameraRotation] Already rotating, ignoring click');
      return;
    }

    this.isRotating = true;
    this.rotationCount++;

    // 更新信号
    window.__signals__.rotationCount = this.rotationCount;
    window.__signals__.isRotating = true;
    window.__signals__.lastRotationTime = Date.now();

    // 更新状态文字
    this.statusText.setText(`Rotation Count: ${this.rotationCount} | Status: Rotating...`);

    // 计算目标旋转角度（每次旋转 360 度）
    const targetRotation = this.mainCamera.rotation + Math.PI * 2;

    console.log(JSON.stringify({
      event: 'rotation_started',
      count: this.rotationCount,
      currentRotation: this.mainCamera.rotation,
      targetRotation: targetRotation,
      duration: 3000,
      timestamp: Date.now()
    }));

    // 触发相机旋转效果，持续 3 秒
    this.mainCamera.rotateTo(targetRotation, false, 3000, 'Linear', true, (camera, progress) => {
      // 旋转过程中的回调
      window.__signals__.cameraRotation = camera.rotation;

      // 旋转完成
      if (progress === 1) {
        this.isRotating = false;
        window.__signals__.isRotating = false;
        
        this.statusText.setText(`Rotation Count: ${this.rotationCount} | Status: Ready`);

        console.log(JSON.stringify({
          event: 'rotation_completed',
          count: this.rotationCount,
          finalRotation: camera.rotation,
          timestamp: Date.now()
        }));
      }
    });
  }

  update(time, delta) {
    // 实时更新相机旋转角度到信号
    window.__signals__.cameraRotation = this.mainCamera.rotation;
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

console.log('[Phaser3] Game initialized - Click left mouse button to trigger camera rotation');