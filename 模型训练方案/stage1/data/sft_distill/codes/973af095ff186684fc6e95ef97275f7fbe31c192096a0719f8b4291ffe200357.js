class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.distanceToEnemy = 0;
    this.isCollided = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（位于中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（位于左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 玩家速度常量
    this.playerSpeed = 80 * 1.2; // 96

    // 敌人速度常量
    this.enemySpeed = 80;

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCollision, null, this);

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    // 如果已碰撞，停止游戏逻辑
    if (this.isCollided) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);

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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distanceToEnemy = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y
      )
    );

    // 更新状态显示
    this.statusText.setText([
      `Survival Time: ${this.survivalTime}s`,
      `Distance to Enemy: ${this.distanceToEnemy}px`,
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`,
      `Collision: ${this.isCollided ? 'YES - GAME OVER' : 'NO'}`
    ]);
  }

  onCollision(player, enemy) {
    // 设置碰撞状态
    this.isCollided = true;

    // 停止所有移动
    player.setVelocity(0);
    enemy.setVelocity(0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    // 显示最终统计
    const finalStats = this.add.text(400, 360, `Survived: ${this.survivalTime}s`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    finalStats.setOrigin(0.5);
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