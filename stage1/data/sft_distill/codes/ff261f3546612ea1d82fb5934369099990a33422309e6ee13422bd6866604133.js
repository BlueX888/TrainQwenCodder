class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建一个移动的方块作为游戏运行的可视化标识
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 50, 50);
    graphics.generateTexture('playerTex', 50, 50);
    graphics.destroy();

    this.player = this.add.sprite(100, 300, 'playerTex');
    this.player.setOrigin(0.5);

    // 添加速度属性
    this.playerVelocity = 200;

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加键盘事件监听
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 添加分数文本用于状态验证
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加状态指示文本
    this.statusText = this.add.text(16, 50, 'Status: Running', {
      fontSize: '20px',
      fill: '#00ff00'
    });
  }

  createPauseOverlay() {
    // 创建半透明灰色背景
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.7);
    this.pauseOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pauseText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'PAUSED',
      {
        fontSize: '64px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);
    this.pauseText.setVisible(false);

    // 添加提示文字
    this.pauseHint = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 80,
      'Press SPACE to resume',
      {
        fontSize: '24px',
        fill: '#cccccc'
      }
    );
    this.pauseHint.setOrigin(0.5);
    this.pauseHint.setDepth(101);
    this.pauseHint.setVisible(false);
  }

  togglePause() {
    if (this.isPaused) {
      // 恢复游戏
      this.scene.resume();
      this.isPaused = false;
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      this.pauseHint.setVisible(false);
      this.statusText.setText('Status: Running');
      this.statusText.setColor('#00ff00');
    } else {
      // 暂停游戏
      this.scene.pause();
      this.isPaused = true;
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      this.pauseHint.setVisible(true);
      this.statusText.setText('Status: Paused');
      this.statusText.setColor('#ff0000');
    }
  }

  update(time, delta) {
    // 移动玩家方块（仅在未暂停时执行）
    this.player.x += this.playerVelocity * (delta / 1000);

    // 边界检测，到达右边界后从左边重新出现
    if (this.player.x > this.scale.width + 25) {
      this.player.x = -25;
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
    }
  }
}

// 暂停管理场景（用于处理暂停时的输入）
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    // 监听空格键以恢复游戏
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      const gameScene = this.scene.get('GameScene');
      if (gameScene.isPaused) {
        gameScene.togglePause();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, PauseScene]
};

const game = new Phaser.Game(config);