class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 暂停状态标志（可验证）
    this.score = 0; // 分数状态（可验证）
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 添加玩家
    this.player = this.add.sprite(400, 500, 'player');
    this.player.setData('velocityX', 2);

    // 添加多个移动的敌人以验证暂停效果
    this.enemies = this.add.group();
    for (let i = 0; i < 5; i++) {
      const enemy = this.add.sprite(
        100 + i * 150,
        100 + i * 50,
        'enemy'
      );
      enemy.setData('velocityX', 1 + i * 0.5);
      enemy.setData('velocityY', 0.5 + i * 0.3);
      this.enemies.add(enemy);
    }

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.scoreText.setDepth(1);

    // 显示提示
    this.add.text(16, 50, 'Press SPACE to pause/resume', {
      fontSize: '18px',
      color: '#cccccc'
    });

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 分数计时器
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      },
      loop: true
    });
  }

  createPauseOverlay() {
    // 创建半透明黄色背景
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0xffff00, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(10);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文本
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#000000',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(11);
    this.pausedText.setVisible(false);

    // 添加提示文本
    this.resumeText = this.add.text(400, 380, 'Press SPACE to resume', {
      fontSize: '24px',
      color: '#333333'
    });
    this.resumeText.setOrigin(0.5);
    this.resumeText.setDepth(11);
    this.resumeText.setVisible(false);
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.resumeGame();
    } else {
      // 暂停游戏
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;

    // 暂停场景（停止 update 和计时器）
    this.scene.pause();

    // 显示暂停覆盖层
    this.pauseOverlay.setVisible(true);
    this.pausedText.setVisible(true);
    this.resumeText.setVisible(true);

    // 重新启动场景以继续接收输入（但不执行 update）
    // 使用一个技巧：创建一个只处理输入的覆盖场景
    this.scene.launch('PauseScene', { gameScene: this });
  }

  resumeGame() {
    this.isPaused = false;

    // 隐藏暂停覆盖层
    this.pauseOverlay.setVisible(false);
    this.pausedText.setVisible(false);
    this.resumeText.setVisible(false);

    // 停止暂停场景
    this.scene.stop('PauseScene');

    // 继续游戏场景
    this.scene.resume();
  }

  update(time, delta) {
    // 玩家左右移动
    const playerVelX = this.player.getData('velocityX');
    this.player.x += playerVelX;

    // 边界反弹
    if (this.player.x > 780 || this.player.x < 20) {
      this.player.setData('velocityX', -playerVelX);
    }

    // 敌人移动
    this.enemies.children.entries.forEach(enemy => {
      const velX = enemy.getData('velocityX');
      const velY = enemy.getData('velocityY');

      enemy.x += velX;
      enemy.y += velY;

      // 边界反弹
      if (enemy.x > 780 || enemy.x < 20) {
        enemy.setData('velocityX', -velX);
      }
      if (enemy.y > 580 || enemy.y < 20) {
        enemy.setData('velocityY', -velY);
      }
    });
  }
}

// 暂停场景：只处理空格键输入
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    // 监听空格键以恢复游戏
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      if (this.gameScene) {
        this.gameScene.resumeGame();
      }
    });
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

const game = new Phaser.Game(config);

// 导出状态供外部验证
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const gameScene = game.scene.getScene('GameScene');
    return {
      isPaused: gameScene ? gameScene.isPaused : false,
      score: gameScene ? gameScene.score : 0
    };
  };
}