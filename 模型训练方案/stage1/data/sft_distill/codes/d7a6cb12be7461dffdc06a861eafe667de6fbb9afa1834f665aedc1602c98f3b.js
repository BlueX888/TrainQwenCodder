// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isPaused = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家（使用 Graphics 绘制）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5);

    // 创建一些移动的目标物体
    this.targets = this.add.group();
    for (let i = 0; i < 5; i++) {
      const targetGraphics = this.add.graphics();
      targetGraphics.fillStyle(0xff0000, 1);
      targetGraphics.fillCircle(15, 15, 15);
      targetGraphics.generateTexture('target', 30, 30);
      targetGraphics.destroy();

      const target = this.add.sprite(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550),
        'target'
      );
      target.speedX = Phaser.Math.Between(-100, 100);
      target.speedY = Phaser.Math.Between(-100, 100);
      this.targets.add(target);
    }

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听方向键按下事件用于暂停/继续
    this.input.keyboard.on('keydown', (event) => {
      // 检查是否是方向键
      if (event.keyCode >= 37 && event.keyCode <= 40) {
        this.togglePause();
      }
    });

    // 添加碰撞检测
    this.physics.world.enable([this.player, ...this.targets.getChildren()]);
    this.player.body.setCollideWorldBounds(true);

    // 游戏状态日志
    console.log('Game started - Score:', this.score);
  }

  update(time, delta) {
    // 玩家移动（使用 WASD 键，避免与暂停冲突）
    const speed = 200;
    this.player.body.setVelocity(0);

    const wKey = this.input.keyboard.addKey('W');
    const aKey = this.input.keyboard.addKey('A');
    const sKey = this.input.keyboard.addKey('S');
    const dKey = this.input.keyboard.addKey('D');

    if (wKey.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (sKey.isDown) {
      this.player.body.setVelocityY(speed);
    }

    if (aKey.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (dKey.isDown) {
      this.player.body.setVelocityX(speed);
    }

    // 更新目标物体位置
    this.targets.getChildren().forEach((target) => {
      target.x += target.speedX * (delta / 1000);
      target.y += target.speedY * (delta / 1000);

      // 边界反弹
      if (target.x <= 15 || target.x >= 785) {
        target.speedX *= -1;
      }
      if (target.y <= 15 || target.y >= 585) {
        target.speedY *= -1;
      }

      // 碰撞检测
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        target.x,
        target.y
      );

      if (distance < 35) {
        // 收集目标
        target.x = Phaser.Math.Between(50, 750);
        target.y = Phaser.Math.Between(50, 550);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        console.log('Score updated:', this.score);
      }
    });
  }

  togglePause() {
    if (!this.isPaused) {
      // 暂停游戏
      this.isPaused = true;
      this.scene.pause();
      console.log('Game paused - Current score:', this.score);

      // 启动暂停覆盖层场景
      this.scene.launch('PauseScene');
    } else {
      // 继续游戏
      this.isPaused = false;
      this.scene.resume();
      console.log('Game resumed - Current score:', this.score);

      // 停止暂停覆盖层场景
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
    // 无需预加载
  }

  create() {
    // 创建白色半透明覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0xffffff, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 显示 "PAUSED" 文本
    const pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      fill: '#000',
      fontStyle: 'bold'
    });
    pausedText.setOrigin(0.5);

    // 显示提示信息
    const hintText = this.add.text(400, 380, 'Press any arrow key to resume', {
      fontSize: '24px',
      fill: '#333'
    });
    hintText.setOrigin(0.5);

    // 监听方向键恢复游戏
    this.input.keyboard.on('keydown', (event) => {
      if (event.keyCode >= 37 && event.keyCode <= 40) {
        // 通知主场景恢复
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.isPaused) {
          gameScene.togglePause();
        }
      }
    });

    console.log('Pause overlay displayed');
  }

  update() {
    // 暂停场景不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene, PauseScene]
};

// 启动游戏
const game = new Phaser.Game(config);