class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.fadeInCount = 0;  // 淡入次数（状态信号）
    this.fadeOutCount = 0; // 淡出次数（状态信号）
    this.isEffectActive = false; // 防止效果重叠
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建彩色方块作为视觉参照
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    for (let i = 0; i < 6; i++) {
      const box = this.add.graphics();
      box.fillStyle(colors[i], 1);
      box.fillRect(100 + i * 120, 250, 80, 80);
    }

    // 创建中心圆形
    const circle = this.add.graphics();
    circle.fillStyle(0xffffff, 1);
    circle.fillCircle(400, 300, 50);

    // 创建说明文本
    const titleText = this.add.text(400, 50, 'Camera Fade Effect Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    const instructionText = this.add.text(400, 120, 
      'Press UP/RIGHT for Fade In\nPress DOWN/LEFT for Fade Out', {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    });
    instructionText.setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#00ff00'
    });
    this.statusText.setOrigin(0.5);
    this.updateStatusText();

    // 效果状态提示
    this.effectText = this.add.text(400, 450, '', {
      fontSize: '24px',
      color: '#ff6600',
      fontStyle: 'bold'
    });
    this.effectText.setOrigin(0.5);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听淡入淡出效果完成事件
    this.cameras.main.on('camerafadeincomplete', () => {
      this.isEffectActive = false;
      this.effectText.setText('');
    });

    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.isEffectActive = false;
      this.effectText.setText('');
    });

    // 键盘按下标记（防止长按重复触发）
    this.upPressed = false;
    this.downPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;
  }

  update() {
    // 检测方向键按下（边缘检测，防止长按重复触发）
    
    // UP键 - 淡入
    if (this.cursors.up.isDown && !this.upPressed) {
      this.upPressed = true;
      this.triggerFadeIn();
    }
    if (this.cursors.up.isUp) {
      this.upPressed = false;
    }

    // DOWN键 - 淡出
    if (this.cursors.down.isDown && !this.downPressed) {
      this.downPressed = true;
      this.triggerFadeOut();
    }
    if (this.cursors.down.isUp) {
      this.downPressed = false;
    }

    // LEFT键 - 淡出
    if (this.cursors.left.isDown && !this.leftPressed) {
      this.leftPressed = true;
      this.triggerFadeOut();
    }
    if (this.cursors.left.isUp) {
      this.leftPressed = false;
    }

    // RIGHT键 - 淡入
    if (this.cursors.right.isDown && !this.rightPressed) {
      this.rightPressed = true;
      this.triggerFadeIn();
    }
    if (this.cursors.right.isUp) {
      this.rightPressed = false;
    }
  }

  triggerFadeIn() {
    if (this.isEffectActive) {
      return; // 如果效果正在执行，忽略新的触发
    }

    this.isEffectActive = true;
    this.fadeInCount++;
    this.updateStatusText();
    this.effectText.setText('Fading In...');

    // 触发淡入效果，持续 1000 毫秒（1秒）
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  triggerFadeOut() {
    if (this.isEffectActive) {
      return; // 如果效果正在执行，忽略新的触发
    }

    this.isEffectActive = true;
    this.fadeOutCount++;
    this.updateStatusText();
    this.effectText.setText('Fading Out...');

    // 触发淡出效果，持续 1000 毫秒（1秒）
    this.cameras.main.fadeOut(1000, 0, 0, 0);
  }

  updateStatusText() {
    this.statusText.setText(
      `Fade In Count: ${this.fadeInCount} | Fade Out Count: ${this.fadeOutCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

new Phaser.Game(config);