class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.gameTime = 0;
    this.pauseCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建玩家
    this.player = this.add.rectangle(400, 300, 40, 40, 0xff0000);
    this.player.speed = 200;

    // 创建移动的背景元素（用于验证暂停效果）
    this.movingObjects = [];
    for (let i = 0; i < 5; i++) {
      const obj = this.add.circle(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550),
        20,
        0xffff00
      );
      obj.velocityX = Phaser.Math.Between(-100, 100);
      obj.velocityY = Phaser.Math.Between(-100, 100);
      this.movingObjects.push(obj);
    }

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建控制提示
    this.add.text(10, 560, 'Press W/A/S/D to pause/resume', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键事件
    this.keyW.on('down', () => this.togglePause());
    this.keyA.on('down', () => this.togglePause());
    this.keyS.on('down', () => this.togglePause());
    this.keyD.on('down', () => this.togglePause());

    // 方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化暂停覆盖层（但不显示）
    this.pauseOverlay = null;
    this.pauseText = null;

    this.updateStatusText();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseCount++;

    if (this.isPaused) {
      // 暂停游戏
      this.showPauseOverlay();
    } else {
      // 继续游戏
      this.hidePauseOverlay();
    }

    this.updateStatusText();
  }

  showPauseOverlay() {
    // 创建青色半透明覆盖层
    this.pauseOverlay = this.add.rectangle(
      400, 300,
      800, 600,
      0x00ffff, 0.5
    );
    this.pauseOverlay.setDepth(100);

    // 创建"PAUSED"文本
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.pauseText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  hidePauseOverlay() {
    // 移除覆盖层和文本
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }

    if (this.pauseText) {
      this.tweens.killTweensOf(this.pauseText);
      this.pauseText.destroy();
      this.pauseText = null;
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Game Time: ${(this.gameTime / 1000).toFixed(1)}s`,
      `Status: ${this.isPaused ? 'PAUSED' : 'RUNNING'}`,
      `Pause Count: ${this.pauseCount}`
    ]);
  }

  update(time, delta) {
    // 如果游戏暂停，不更新游戏逻辑
    if (this.isPaused) {
      return;
    }

    // 更新游戏时间
    this.gameTime += delta;

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.x -= this.player.speed * delta / 1000;
    } else if (this.cursors.right.isDown) {
      this.player.x += this.player.speed * delta / 1000;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= this.player.speed * delta / 1000;
    } else if (this.cursors.down.isDown) {
      this.player.y += this.player.speed * delta / 1000;
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 更新移动的背景元素
    this.movingObjects.forEach(obj => {
      obj.x += obj.velocityX * delta / 1000;
      obj.y += obj.velocityY * delta / 1000;

      // 边界反弹
      if (obj.x < 20 || obj.x > 780) {
        obj.velocityX *= -1;
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
      }
      if (obj.y < 20 || obj.y > 580) {
        obj.velocityY *= -1;
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      }
    });

    // 每秒更新一次状态文本
    if (Math.floor(this.gameTime / 100) !== Math.floor((this.gameTime - delta) / 100)) {
      this.updateStatusText();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);