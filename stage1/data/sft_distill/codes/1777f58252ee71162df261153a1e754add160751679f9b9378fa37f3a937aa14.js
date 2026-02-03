class FlashCameraScene extends Phaser.Scene {
  constructor() {
    super('FlashCameraScene');
    this.flashCount = 0; // 可验证的状态信号
    this.isFlashing = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景 - 使用 Graphics 绘制彩色网格
    const graphics = this.add.graphics();
    
    // 绘制彩色背景网格，便于观察闪烁效果
    const colors = [0x6366f1, 0x8b5cf6, 0xec4899, 0xf43f5e];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        graphics.fillStyle(colors[(i + j) % colors.length], 1);
        graphics.fillRect(i * 200, j * 200, 200, 200);
      }
    }

    // 添加中心圆形作为视觉参考
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(400, 300, 80);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(400, 300, 60);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加标题文本
    this.add.text(400, 50, 'Camera Flash Effect Demo', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 添加提示文本
    this.instructionText = this.add.text(400, 120, 'Press Arrow Keys to Flash Camera', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 500, `Flash Count: ${this.flashCount}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 添加当前状态指示
    this.stateText = this.add.text(400, 550, 'Status: Ready', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听闪烁完成事件
    this.mainCamera.on('cameraflashcomplete', () => {
      this.isFlashing = false;
      this.stateText.setText('Status: Ready');
      this.stateText.setColor('#ffffff');
    });

    // 监听闪烁开始事件
    this.mainCamera.on('cameraflashstart', () => {
      this.stateText.setText('Status: Flashing...');
      this.stateText.setColor('#ff0000');
    });
  }

  update(time, delta) {
    // 检查是否有方向键被按下，且当前没有在闪烁
    if (!this.isFlashing) {
      let shouldFlash = false;
      let direction = '';

      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        shouldFlash = true;
        direction = 'UP';
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        shouldFlash = true;
        direction = 'DOWN';
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        shouldFlash = true;
        direction = 'LEFT';
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        shouldFlash = true;
        direction = 'RIGHT';
      }

      if (shouldFlash) {
        // 触发相机闪烁效果
        // 参数: duration(持续时间), red, green, blue, force(是否强制), callback
        this.mainCamera.flash(
          3000,        // 持续 3 秒（3000 毫秒）
          255,         // 红色分量
          255,         // 绿色分量
          255,         // 蓝色分量
          false        // 不强制重新开始
        );

        // 更新状态
        this.isFlashing = true;
        this.flashCount++;

        // 更新状态文本
        this.statusText.setText(`Flash Count: ${this.flashCount}`);
        this.instructionText.setText(`Last Pressed: ${direction} Arrow`);

        // 在控制台输出日志
        console.log(`Flash triggered by ${direction} key. Total count: ${this.flashCount}`);
      }
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d3748',
  scene: FlashCameraScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);