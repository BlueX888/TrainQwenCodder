class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.fadeCount = 0; // 可验证的状态信号：淡入淡出触发次数
    this.lastFadeTime = 0; // 上次触发时间
    this.fadeCooldown = 1000; // 冷却时间（毫秒）
    this.isFading = false; // 是否正在执行淡入淡出
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些彩色方块作为视觉参考
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
    for (let i = 0; i < 4; i++) {
      const box = this.add.graphics();
      box.fillStyle(colors[i], 1);
      box.fillRect(150 + i * 150, 200, 100, 100);
    }

    // 创建标题文本
    this.titleText = this.add.text(400, 80, 'Camera Fade Effect Demo', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.instructionText = this.add.text(400, 150, 'Press Arrow Keys to Trigger Fade Effect', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(400, 450, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建计数器文本
    this.counterText = this.add.text(400, 500, `Fade Count: ${this.fadeCount}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建方向键提示
    const keyHints = [
      { key: '↑', x: 400, y: 350, label: 'UP: Fade Out' },
      { key: '↓', x: 400, y: 520, label: 'DOWN: Fade In' },
      { key: '←', x: 250, y: 435, label: 'LEFT: Fade Out' },
      { key: '→', x: 550, y: 435, label: 'RIGHT: Fade In' }
    ];

    keyHints.forEach(hint => {
      this.add.text(hint.x, hint.y, hint.key, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#555555',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
    });

    // 初始化键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听淡入淡出完成事件
    this.mainCamera.on('camerafadeincomplete', () => {
      this.isFading = false;
      this.statusText.setText('Fade In Complete!');
    });

    this.mainCamera.on('camerafadeoutcomplete', () => {
      this.isFading = false;
      this.statusText.setText('Fade Out Complete!');
    });

    this.updateStatus('Ready - Press any arrow key');
  }

  update(time, delta) {
    // 检查冷却时间
    if (time - this.lastFadeTime < this.fadeCooldown || this.isFading) {
      return;
    }

    // 检测方向键按下
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.triggerFadeOut();
      this.lastFadeTime = time;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.triggerFadeIn();
      this.lastFadeTime = time;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.triggerFadeOut();
      this.lastFadeTime = time;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.triggerFadeIn();
      this.lastFadeTime = time;
    }
  }

  triggerFadeOut() {
    this.isFading = true;
    this.fadeCount++;
    this.updateCounter();
    this.updateStatus('Fading Out...');
    
    // 淡出效果：画面渐变到黑色，持续 1000 毫秒
    this.mainCamera.fadeOut(1000, 0, 0, 0);
  }

  triggerFadeIn() {
    this.isFading = true;
    this.fadeCount++;
    this.updateCounter();
    this.updateStatus('Fading In...');
    
    // 淡入效果：从黑色渐变回正常，持续 1000 毫秒
    this.mainCamera.fadeIn(1000, 0, 0, 0);
  }

  updateStatus(message) {
    this.statusText.setText(message);
  }

  updateCounter() {
    this.counterText.setText(`Fade Count: ${this.fadeCount}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);