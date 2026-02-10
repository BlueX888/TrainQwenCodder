// 完整的 Phaser3 蓝色敌人追踪游戏
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.collisionCount = 0;
    this.gameTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemyTex', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemyTex');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys to Move\nPlayer Speed: 360\nEnemy Speed: 300', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 显示碰撞计数
    this.collisionText = this.add.text(10, 100, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示距离
    this.distanceText = this.add.text(10, 140, 'Distance: 0', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化 signals
    window.__signals__ = {
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      collisionCount: 0,
      distance: 0,
      playerPosition: { x: 400, y: 300 },
      enemyPosition: { x: 100, y: 100 },
      gameTime: 0
    };

    console.log(JSON.stringify({
      type: 'GAME_START',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    this.gameTime += delta;

    // 重置玩家速度
    this.player.setVelocity(0);

    // 处理玩家移动
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
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新显示
    this.distanceText.setText(`Distance: ${Math.round(distance)}`);

    // 更新 signals
    window.__signals__.distance = Math.round(distance);
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyPosition = {
      x: Math.round(this.enemy.x),
      y: Math.round(this.enemy.y)
    };
    window.__signals__.gameTime = Math.round(this.gameTime);

    // 每秒输出一次状态日志
    if (Math.floor(this.gameTime / 1000) > Math.floor((this.gameTime - delta) / 1000)) {
      console.log(JSON.stringify({
        type: 'GAME_STATE',
        distance: Math.round(distance),
        collisionCount: this.collisionCount,
        playerPos: window.__signals__.playerPosition,
        enemyPos: window.__signals__.enemyPosition,
        gameTime: Math.round(this.gameTime / 1000),
        timestamp: Date.now()
      }));
    }
  }

  handleCollision(player, enemy) {
    // 碰撞时短暂分离
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.x += Math.cos(angle) * 50;
    player.y += Math.sin(angle) * 50;

    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 更新 signals
    window.__signals__.collisionCount = this.collisionCount;

    console.log(JSON.stringify({
      type: 'COLLISION',
      count: this.collisionCount,
      position: { x: Math.round(player.x), y: Math.round(player.y) },
      timestamp: Date.now()
    }));
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

// 启动游戏
new Phaser.Game(config);