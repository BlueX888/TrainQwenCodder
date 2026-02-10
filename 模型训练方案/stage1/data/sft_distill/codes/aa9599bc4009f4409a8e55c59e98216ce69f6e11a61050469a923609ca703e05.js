class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.gameOver = false;
    this.distance = 0;
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

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（左上角位置）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(10, 550, '方向键移动 | 玩家速度: 240 | 敌人速度: 200', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制（速度 200 * 1.2 = 240）
    const playerSpeed = 200 * 1.2;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 200）
    this.physics.moveToObject(this.enemy, this.player, 200);

    // 计算距离
    this.distance = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y
      )
    );

    // 更新状态文本
    this.updateStatusText();
  }

  handleCollision(player, enemy) {
    this.collisionCount++;
    
    // 碰撞后将敌人重置到远处
    const angle = Phaser.Math.Between(0, 360);
    const distance = 300;
    enemy.x = player.x + Math.cos(Phaser.Math.DegToRad(angle)) * distance;
    enemy.y = player.y + Math.sin(Phaser.Math.DegToRad(angle)) * distance;

    // 确保敌人在世界边界内
    enemy.x = Phaser.Math.Clamp(enemy.x, 16, 784);
    enemy.y = Phaser.Math.Clamp(enemy.y, 16, 584);

    // 如果碰撞3次，游戏结束
    if (this.collisionCount >= 3) {
      this.gameOver = true;
      this.enemy.setVelocity(0);
      this.player.setVelocity(0);
    }
  }

  updateStatusText() {
    const status = this.gameOver ? 'GAME OVER' : 'RUNNING';
    this.statusText.setText(
      `距离: ${this.distance}px | 碰撞次数: ${this.collisionCount}/3 | 状态: ${status}`
    );
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