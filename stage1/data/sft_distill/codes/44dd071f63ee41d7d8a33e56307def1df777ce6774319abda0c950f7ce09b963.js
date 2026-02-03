// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建程序化纹理 - 红色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture('redBox', 64, 64);
    graphics.destroy();

    // 创建旋转的游戏对象用于验证暂停效果
    this.player = this.add.sprite(400, 300, 'redBox');
    this.player.setOrigin(0.5);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff'
    });

    // 创建提示文本
    this.add.text(400, 550, 'Click to Pause/Resume', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 创建计时器，每秒增加分数（用于验证暂停）
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: this.incrementScore,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 旋转玩家对象（用于视觉验证暂停）
    this.player.rotation += 0.02;
  }

  incrementScore() {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  togglePause() {
    if (!this.isPaused) {
      // 暂停游戏
      this.isPaused = true;
      this.scene.pause();
      this.scene.launch('PauseScene');
    } else {
      // 继续游戏
      this.isPaused = false;
      this.scene.resume();
      this.scene.stop('PauseScene');
    }
  }
}

// 暂停覆盖层场景
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建半透明青色背景覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0x00ffff, 0.5);
    overlay.fillRect(0, 0, 800, 600);

    // 创建 "PAUSED" 文本
    this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 380, 'Click to Resume', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件以恢复游戏
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        const gameScene = this.scene.get('GameScene');
        gameScene.togglePause();
      }
    });
  }

  update(time, delta) {
    // 暂停场景不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, PauseScene]
};

// 创建游戏实例
new Phaser.Game(config);