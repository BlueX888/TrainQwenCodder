class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.survivalTime = 0;
    this.playerSpeed = 200;
    this.enemySpeed = 160;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
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

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在场景周围随机位置生成5个敌人
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

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 添加提示文本
    this.infoText = this.add.text(16, 16, 'Use Arrow Keys to Dodge!', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.timeText = this.add.text(16, 45, 'Time: 0s', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      gameOver: false,
      survivalTime: 0,
      playerAlive: true,
      enemyCount: 5,
      playerPosition: { x: 400, y: 300 }
    };

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
    this.survivalTime += delta;
    const seconds = Math.floor(this.survivalTime / 1000);
    this.timeText.setText(`Time: ${seconds}s`);

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
    });

    // 更新信号
    window.__signals__.survivalTime = seconds;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    const finalTime = Math.floor(this.survivalTime / 1000);

    // 停止所有移动
    this.player.setTint(0xff0000);
    this.player.setVelocity(0);
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0);
    });

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const scoreText = this.add.text(400, 360, `You survived ${finalTime} seconds!`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 更新最终信号
    window.__signals__.gameOver = true;
    window.__signals__.playerAlive = false;
    window.__signals__.finalScore = finalTime;

    console.log(JSON.stringify({
      event: 'game_over',
      timestamp: Date.now(),
      survivalTime: finalTime,
      playerPosition: {
        x: Math.round(player.x),
        y: Math.round(player.y)
      },
      enemyPosition: {
        x: Math.round(enemy.x),
        y: Math.round(enemy.y)
      }
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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