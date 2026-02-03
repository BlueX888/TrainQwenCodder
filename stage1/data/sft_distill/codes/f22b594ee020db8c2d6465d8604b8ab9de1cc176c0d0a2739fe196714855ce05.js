class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.survivalTime = 0;
    this.distanceFromEnemy = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 160 * 1.2; // 192

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemySpeed = 160;

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(width / 2, 30, '使用方向键移动躲避粉色敌人', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    console.log('游戏开始 - 玩家速度: 192, 敌人速度: 160');
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;

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
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算与敌人的距离
    this.distanceFromEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新状态显示
    this.statusText.setText([
      `生存时间: ${(this.survivalTime / 1000).toFixed(1)}秒`,
      `与敌人距离: ${Math.floor(this.distanceFromEnemy)}`,
      `玩家速度: ${this.playerSpeed}`,
      `敌人速度: ${this.enemySpeed}`
    ]);
  }

  handleCollision() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    
    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示游戏结束信息
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.add.text(width / 2, height / 2, '游戏结束！', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, `生存时间: ${(this.survivalTime / 1000).toFixed(1)}秒`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 输出状态信号
    console.log('=== 游戏结束状态 ===');
    console.log('gameOver:', this.gameOver);
    console.log('survivalTime:', (this.survivalTime / 1000).toFixed(2), '秒');
    console.log('finalDistance:', Math.floor(this.distanceFromEnemy));
    console.log('playerSpeed:', this.playerSpeed);
    console.log('enemySpeed:', this.enemySpeed);
    console.log('玩家速度比敌人快:', this.playerSpeed > this.enemySpeed ? '是' : '否');
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

new Phaser.Game(config);