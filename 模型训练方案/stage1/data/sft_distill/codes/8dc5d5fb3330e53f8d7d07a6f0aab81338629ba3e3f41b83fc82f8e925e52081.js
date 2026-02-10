// 全局信号对象
window.__signals__ = {
  survivalTime: 0,
  collisionCount: 0,
  playerHealth: 3,
  playerX: 0,
  playerY: 0,
  enemyCount: 3,
  gameOver: false
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.playerSpeed = 300;
    this.enemySpeed = 360;
    this.health = 3;
    this.survivalTime = 0;
    this.collisionCount = 0;
    this.isGameOver = false;
    this.healthText = null;
    this.timeText = null;
    this.gameOverText = null;
  }

  preload() {
    // 不需要加载外部资源
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
    
    // 在不同位置创建3个敌人
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建UI文本
    this.healthText = this.add.text(16, 16, 'Health: 3', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timeText = this.add.text(16, 50, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(16, 84, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    // 记录开始时间
    this.startTime = this.time.now;

    // 初始化信号
    this.updateSignals();

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      playerHealth: this.health,
      enemyCount: 3
    }));
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText(`Time: ${this.survivalTime}s`);

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

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
    });

    // 更新信号
    this.updateSignals();
  }

  handleCollision(player, enemy) {
    // 避免重复碰撞检测
    if (this.isGameOver) {
      return;
    }

    // 减少生命值
    this.health--;
    this.collisionCount++;
    this.healthText.setText(`Health: ${this.health}`);

    // 将敌人推开
    const angle = Phaser.Math.Angle.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );
    this.physics.velocityFromRotation(angle, 500, enemy.body.velocity);

    // 玩家短暂无敌并闪烁
    this.player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      if (this.player) {
        this.player.clearTint();
      }
    });

    console.log(JSON.stringify({
      event: 'collision',
      timestamp: Date.now(),
      healthRemaining: this.health,
      collisionCount: this.collisionCount,
      survivalTime: this.survivalTime
    }));

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;

    // 停止所有物体
    this.player.setVelocity(0);
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 显示游戏结束文本
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 370, `Survived: ${this.survivalTime}s`, {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(400, 410, `Collisions: ${this.collisionCount}`, {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 更新最终信号
    this.updateSignals();

    console.log(JSON.stringify({
      event: 'game_over',
      timestamp: Date.now(),
      survivalTime: this.survivalTime,
      collisionCount: this.collisionCount,
      finalScore: this.survivalTime * 10
    }));
  }

  updateSignals() {
    window.__signals__.survivalTime = this.survivalTime;
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.playerHealth = this.health;
    window.__signals__.playerX = Math.floor(this.player.x);
    window.__signals__.playerY = Math.floor(this.player.y);
    window.__signals__.gameOver = this.isGameOver;
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
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);