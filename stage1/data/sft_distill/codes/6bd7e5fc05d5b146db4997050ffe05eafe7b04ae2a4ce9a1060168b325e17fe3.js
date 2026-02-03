class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.gameOver = false;
    this.enemySpeed = 160;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      survivalTime: 0,
      gameOver: false,
      playerCaught: false,
      enemyCount: 5,
      playerPosition: { x: 0, y: 0 }
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200, 200);
    this.player.setDrag(800, 800);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在地图边缘随机位置创建5个敌人
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 50 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加文本显示
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 550, 'Use Arrow Keys or WASD to move. Avoid the red enemies!', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 开始计时
    this.startTime = this.time.now;

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      enemyCount: 5,
      enemySpeed: this.enemySpeed
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    const acceleration = 600;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 敌人追踪玩家
    this.enemies.getChildren().forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
    });

    // 更新signals
    window.__signals__.survivalTime = parseFloat(this.survivalTime.toFixed(2));
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 每秒输出一次状态
    if (Math.floor(this.survivalTime) !== this.lastLoggedSecond) {
      this.lastLoggedSecond = Math.floor(this.survivalTime);
      console.log(JSON.stringify({
        event: 'game_update',
        survivalTime: this.survivalTime.toFixed(2),
        playerPosition: window.__signals__.playerPosition,
        timestamp: Date.now()
      }));
    }
  }

  handleCollision(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止所有敌人
    this.enemies.getChildren().forEach(e => {
      e.body.setVelocity(0, 0);
    });

    // 停止玩家
    this.player.body.setVelocity(0, 0);
    this.player.body.setAcceleration(0, 0);
    this.player.setTint(0xff0000);

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 370, `You survived for ${this.survivalTime.toFixed(2)} seconds`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 更新signals
    window.__signals__.gameOver = true;
    window.__signals__.playerCaught = true;
    window.__signals__.survivalTime = parseFloat(this.survivalTime.toFixed(2));

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: this.survivalTime.toFixed(2),
      playerCaught: true,
      timestamp: Date.now()
    }));
  }
}

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
  scene: GameScene
};

const game = new Phaser.Game(config);