class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameSpeed = 100;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家（使用Graphics程序化生成）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 创建移动的障碍物作为游戏状态验证
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0xff0000, 1);
    obstacleGraphics.fillRect(0, 0, 30, 30);
    obstacleGraphics.generateTexture('obstacle', 30, 30);
    obstacleGraphics.destroy();

    this.obstacles = this.add.group();
    for (let i = 0; i < 5; i++) {
      const obstacle = this.add.sprite(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550),
        'obstacle'
      );
      obstacle.setData('speedX', Phaser.Math.Between(-100, 100));
      obstacle.setData('speedY', Phaser.Math.Between(-100, 100));
      this.obstacles.add(obstacle);
    }

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建游戏速度显示
    this.speedText = this.add.text(16, 50, 'Speed: 100', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 创建暂停提示
    this.hintText = this.add.text(400, 560, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '18px',
      fill: '#888888',
      fontFamily: 'Arial'
    });
    this.hintText.setOrigin(0.5, 0.5);

    // 创建暂停覆盖层（青色半透明）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00ffff, 0.5); // 青色，50%透明度
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setVisible(false);
    this.pauseOverlay.setDepth(100); // 确保在最上层

    // 创建"PAUSED"文本
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pausedText.setOrigin(0.5, 0.5);
    this.pausedText.setVisible(false);
    this.pausedText.setDepth(101); // 在覆盖层之上

    // 监听WASD键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 为每个键添加按下事件监听
    this.keyW.on('down', () => this.togglePause());
    this.keyA.on('down', () => this.togglePause());
    this.keyS.on('down', () => this.togglePause());
    this.keyD.on('down', () => this.togglePause());

    // 创建方向键用于移动玩家（验证游戏运行状态）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化计时器用于增加分数
    this.scoreTimer = 0;
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      this.scene.pause();
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      this.scene.resume();
    }
  }

  update(time, delta) {
    // 玩家移动控制（使用方向键）
    const playerSpeed = 200;
    if (this.cursors.left.isDown) {
      this.player.x -= playerSpeed * (delta / 1000);
    }
    if (this.cursors.right.isDown) {
      this.player.x += playerSpeed * (delta / 1000);
    }
    if (this.cursors.up.isDown) {
      this.player.y -= playerSpeed * (delta / 1000);
    }
    if (this.cursors.down.isDown) {
      this.player.y += playerSpeed * (delta / 1000);
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

    // 更新障碍物移动
    this.obstacles.getChildren().forEach(obstacle => {
      const speedX = obstacle.getData('speedX');
      const speedY = obstacle.getData('speedY');

      obstacle.x += speedX * (delta / 1000);
      obstacle.y += speedY * (delta / 1000);

      // 边界反弹
      if (obstacle.x < 15 || obstacle.x > 785) {
        obstacle.setData('speedX', -speedX);
        obstacle.x = Phaser.Math.Clamp(obstacle.x, 15, 785);
      }
      if (obstacle.y < 15 || obstacle.y > 585) {
        obstacle.setData('speedY', -speedY);
        obstacle.y = Phaser.Math.Clamp(obstacle.y, 15, 585);
      }
    });

    // 更新分数（每秒增加）
    this.scoreTimer += delta;
    if (this.scoreTimer >= 1000) {
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      this.scoreTimer = 0;

      // 增加游戏速度
      this.gameSpeed += 5;
      this.speedText.setText('Speed: ' + this.gameSpeed);
    }
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