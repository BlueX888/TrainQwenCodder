class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0; // 可验证的状态信号
    this.isRotating = false; // 防止重复触发
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 绘制背景网格作为参考
    const graphics = this.add.graphics();
    
    // 绘制网格线
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记（红色圆圈）
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制四个方向的矩形作为参考物体
    const rectGraphics = this.add.graphics();
    
    // 上方矩形（蓝色）
    rectGraphics.fillStyle(0x0000ff, 1);
    rectGraphics.fillRect(350, 100, 100, 50);
    
    // 下方矩形（绿色）
    rectGraphics.fillStyle(0x00ff00, 1);
    rectGraphics.fillRect(350, 450, 100, 50);
    
    // 左方矩形（黄色）
    rectGraphics.fillStyle(0xffff00, 1);
    rectGraphics.fillRect(100, 275, 50, 50);
    
    // 右方矩形（紫色）
    rectGraphics.fillStyle(0xff00ff, 1);
    rectGraphics.fillRect(650, 275, 50, 50);

    // 添加文字提示
    this.instructionText = this.add.text(400, 50, 'Press Arrow Keys to Rotate Camera', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 添加旋转计数显示
    this.countText = this.add.text(400, 550, `Rotations: ${this.rotationCount}`, {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 获取主相机
    this.camera = this.cameras.main;

    // 监听旋转完成事件
    this.camera.on('camerarotatecomplete', () => {
      this.isRotating = false;
    });
  }

  update(time, delta) {
    // 如果正在旋转，不响应新的输入
    if (this.isRotating) {
      return;
    }

    // 检测方向键并触发相应的旋转
    if (this.cursors.up.isDown) {
      this.rotateCamera(0); // 向上：旋转到 0 度
    } else if (this.cursors.down.isDown) {
      this.rotateCamera(Math.PI); // 向下：旋转到 180 度
    } else if (this.cursors.left.isDown) {
      this.rotateCamera(-Math.PI / 2); // 向左：旋转到 -90 度
    } else if (this.cursors.right.isDown) {
      this.rotateCamera(Math.PI / 2); // 向右：旋转到 90 度
    }
  }

  rotateCamera(targetRotation) {
    // 标记正在旋转
    this.isRotating = true;

    // 增加旋转计数
    this.rotationCount++;
    this.countText.setText(`Rotations: ${this.rotationCount}`);

    // 触发相机旋转效果，持续 1500 毫秒（1.5 秒）
    this.camera.rotateTo(targetRotation, false, 1500, 'Sine.easeInOut');

    // 输出日志便于验证
    console.log(`Camera rotating to ${(targetRotation * 180 / Math.PI).toFixed(0)}°, Count: ${this.rotationCount}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);