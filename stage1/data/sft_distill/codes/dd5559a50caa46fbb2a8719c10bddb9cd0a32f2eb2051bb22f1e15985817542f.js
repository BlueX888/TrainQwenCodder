class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.distanceToEnemy = 0; // 可验证状态：玩家与敌人距离
    this.collisionCount = 0;  // 可验证状态：碰撞次数
    this.isAlive = true;      // 可验证状态：玩家存活状态
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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

    // 创建玩家精灵（初始位置在中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人精灵（初始位置在左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.instructionText = this.add.text(10, 550, 
      '方向键移动 | 玩家速度: 144 | 敌人速度: 120', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    if (!this.isAlive) {
      return;
    }

    // 玩家移动控制（速度 120 * 1.2 = 144）
    const playerSpeed = 144;
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

    // 敌人追踪玩家（速度120）
    const enemySpeed = 120;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算距离（可验证状态）
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新状态显示
    this.updateStatusText();
  }

  handleCollision(player, enemy) {
    // 碰撞处理
    this.collisionCount++;
    this.isAlive = false;

    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示碰撞效果
    this.player.setTint(0xff0000);
    
    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'CAUGHT!\nPress R to Restart', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    gameOverText.setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  updateStatusText() {
    const status = [
      `Distance: ${Math.round(this.distanceToEnemy)}px`,
      `Collisions: ${this.collisionCount}`,
      `Status: ${this.isAlive ? 'RUNNING' : 'CAUGHT'}`,
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Enemy: (${Math.round(this.enemy.x)}, ${Math.round(this.enemy.y)})`
    ];
    this.statusText.setText(status.join('\n'));
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