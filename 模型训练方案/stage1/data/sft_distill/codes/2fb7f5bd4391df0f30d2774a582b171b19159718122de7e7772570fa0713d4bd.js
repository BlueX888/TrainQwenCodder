class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.platformsPassed = 0;
    this.isGameOver = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group();
    
    // 创建8个移动平台，形成跳跃路径
    const platformConfigs = [
      { x: 200, y: 450, minX: 150, maxX: 250 },
      { x: 350, y: 400, minX: 300, maxX: 400 },
      { x: 500, y: 350, minX: 450, maxX: 550 },
      { x: 650, y: 300, minX: 600, maxX: 700 },
      { x: 700, y: 250, minX: 650, maxX: 750 },
      { x: 600, y: 200, minX: 550, maxX: 650 },
      { x: 450, y: 150, minX: 400, maxX: 500 },
      { x: 300, y: 100, minX: 250, maxX: 350 }
    ];

    this.platformData = [];
    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.setImmovable(true);
      platform.body.allowGravity = false;
      platform.setVelocityX(80);
      
      this.platformData.push({
        sprite: platform,
        minX: config.minX,
        maxX: config.maxX,
        direction: 1,
        passed: false,
        index: index
      });
    });

    // 创建终点标记
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillCircle(300, 50, 30);
    this.goalText = this.add.text(300, 50, '★', {
      fontSize: '40px',
      fill: '#ff0000'
    }).setOrigin(0.5);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#000'
    });

    this.statusText = this.add.text(16, 50, 'Platforms Passed: 0/8', {
      fontSize: '20px',
      fill: '#000'
    });

    this.instructionText = this.add.text(400, 550, 'Arrow Keys: Move | SPACE: Jump', {
      fontSize: '18px',
      fill: '#000'
    }).setOrigin(0.5);

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);
  }

  onPlatformCollide(player, platform) {
    // 检测是否是新通过的平台
    const platformInfo = this.platformData.find(p => p.sprite === platform);
    if (platformInfo && !platformInfo.passed && player.body.touching.down) {
      platformInfo.passed = true;
      this.platformsPassed++;
      this.score += 100;
      
      this.updateUI();

      // 检查是否通过所有平台
      if (this.platformsPassed >= 8) {
        this.winGame();
      }
    }
  }

  updateUI() {
    this.scoreText.setText('Score: ' + this.score);
    this.statusText.setText('Platforms Passed: ' + this.platformsPassed + '/8');
  }

  winGame() {
    this.isGameOver = true;
    this.gameOverText.setText('YOU WIN!\nScore: ' + this.score);
    this.gameOverText.setVisible(true);
    this.physics.pause();
  }

  gameOver() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.gameOverText.setText('GAME OVER\nPress R to Restart');
    this.gameOverText.setVisible(true);
    this.physics.pause();

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新平台移动
    this.platformData.forEach(data => {
      const platform = data.sprite;
      
      // 检查边界并反转方向
      if (platform.x <= data.minX) {
        platform.x = data.minX;
        data.direction = 1;
        platform.setVelocityX(80);
      } else if (platform.x >= data.maxX) {
        platform.x = data.maxX;
        data.direction = -1;
        platform.setVelocityX(-80);
      }
    });

    // 检查玩家是否掉落
    if (this.player.y > 600) {
      this.gameOver();
    }

    // 检查玩家是否到达终点区域
    const distToGoal = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, 300, 50
    );
    if (distToGoal < 50 && this.platformsPassed >= 8) {
      this.winGame();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);