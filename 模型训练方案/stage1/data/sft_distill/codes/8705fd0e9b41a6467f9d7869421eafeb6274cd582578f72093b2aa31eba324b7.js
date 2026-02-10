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
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 程序化生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(25, 25, 25);
    playerGraphics.generateTexture('player', 50, 50);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setData('velocityX', 2);
    this.player.setData('velocityY', 1.5);

    // 创建计分器文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建暂停提示文本
    this.hintText = this.add.text(400, 550, 'Click to Pause/Resume', {
      fontSize: '20px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    this.hintText.setOrigin(0.5);

    // 创建状态指示器
    this.statusText = this.add.text(16, 60, 'Status: Running', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    // 添加鼠标点击事件监听器
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停主场景
      this.scene.pause();
      // 启动暂停覆盖层场景
      this.scene.launch('PauseScene');
      this.statusText.setText('Status: Paused');
      this.statusText.setColor('#ff0000');
    } else {
      // 恢复主场景
      this.scene.resume();
      // 停止暂停覆盖层场景
      this.scene.stop('PauseScene');
      this.statusText.setText('Status: Running');
      this.statusText.setColor('#00ff00');
    }
  }

  update(time, delta) {
    // 移动玩家精灵（验证暂停功能）
    const velocityX = this.player.getData('velocityX');
    const velocityY = this.player.getData('velocityY');

    this.player.x += velocityX;
    this.player.y += velocityY;

    // 边界碰撞检测
    if (this.player.x <= 25 || this.player.x >= 775) {
      this.player.setData('velocityX', -velocityX);
    }
    if (this.player.y <= 25 || this.player.y >= 575) {
      this.player.setData('velocityY', -velocityY);
    }

    // 更新分数（每帧增加，用于验证暂停）
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
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
    // 创建青色半透明覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0x00ffff, 0.5); // 青色，50% 透明度
    overlay.fillRect(0, 0, 800, 600);

    // 创建暗色背景框
    const pauseBox = this.add.graphics();
    pauseBox.fillStyle(0x0088aa, 0.9);
    pauseBox.fillRoundedRect(250, 200, 300, 200, 20);
    pauseBox.lineStyle(4, 0x00ffff, 1);
    pauseBox.strokeRoundedRect(250, 200, 300, 200, 20);

    // 创建 "PAUSED" 文本
    const pausedText = this.add.text(400, 280, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    pausedText.setOrigin(0.5);

    // 创建提示文本
    const resumeText = this.add.text(400, 350, 'Click to Resume', {
      fontSize: '24px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    resumeText.setOrigin(0.5);

    // 添加鼠标点击事件监听器
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        // 获取主场景并切换暂停状态
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
  backgroundColor: '#000000',
  scene: [GameScene, PauseScene]
};

// 创建游戏实例
new Phaser.Game(config);