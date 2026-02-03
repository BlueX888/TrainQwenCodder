class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 状态信号：玩家生命值
    this.score = 0; // 状态信号：得分（存活时间）
    this.distanceToEnemy = 0; // 状态信号：与敌人距离
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

    // 创建敌人纹理（黄色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 200 * 1.2; // 240

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemySpeed = 200;

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加信息文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制提示
    this.add.text(10, 560, '使用方向键控制蓝色方块躲避黄色敌人', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
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
    if (this.enemy && this.player) {
      this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);
    }

    // 计算距离
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 增加存活得分
    this.score += delta / 1000;

    // 更新信息显示
    this.infoText.setText([
      `生命值: ${this.health}`,
      `存活时间: ${this.score.toFixed(1)}s`,
      `与敌人距离: ${this.distanceToEnemy.toFixed(0)}`,
      `玩家速度: ${this.playerSpeed}`,
      `敌人速度: ${this.enemySpeed}`
    ]);
  }

  handleCollision(player, enemy) {
    // 碰撞时减少生命值
    this.health -= 10;

    // 将敌人推开一段距离
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );
    enemy.x = player.x - Math.cos(angle) * 100;
    enemy.y = player.y - Math.sin(angle) * 100;

    // 游戏结束判定
    if (this.health <= 0) {
      this.health = 0;
      this.gameOver();
    }
  }

  gameOver() {
    // 停止敌人移动
    this.enemy.setVelocity(0);
    this.player.setVelocity(0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 360, `存活时间: ${this.score.toFixed(1)}秒`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    finalScoreText.setOrigin(0.5);

    // 禁用场景更新
    this.scene.pause();
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