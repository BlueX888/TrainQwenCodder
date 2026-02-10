class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.distance = 0; // 玩家与敌人距离
    this.isCaught = false; // 是否被抓住
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const PLAYER_SPEED = 80 * 1.2; // 96
    const ENEMY_SPEED = 80;

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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(PLAYER_SPEED);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 存储速度配置
    this.playerSpeed = PLAYER_SPEED;
    this.enemySpeed = ENEMY_SPEED;

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 状态文本显示
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.distanceText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 84, '', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(400, 550, '使用方向键移动玩家（蓝色），躲避敌人（红色）', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.isCaught) {
      return; // 被抓住后停止更新
    }

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
      const normalized = this.player.body.velocity.normalize();
      this.player.setVelocity(
        normalized.x * this.playerSpeed,
        normalized.y * this.playerSpeed
      );
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distance = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y
      )
    );

    // 更新状态显示
    this.healthText.setText(`Health: ${this.health}`);
    this.distanceText.setText(`Distance: ${this.distance}px`);
    this.statusText.setText(`Status: ${this.health > 0 ? 'Escaping' : 'Caught!'}`);
  }

  onCatch(player, enemy) {
    if (!this.isCaught) {
      this.isCaught = true;
      this.health -= 50; // 减少生命值

      // 停止所有移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);

      // 视觉反馈
      this.player.setTint(0xff0000);

      this.statusText.setText('Status: Caught!');
      this.statusText.setStyle({ fill: '#ff0000' });

      // 2秒后重置
      this.time.delayedCall(2000, () => {
        if (this.health > 0) {
          this.resetGame();
        } else {
          this.statusText.setText('Status: Game Over!');
          this.add.text(400, 300, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
          }).setOrigin(0.5);
        }
      });
    }
  }

  resetGame() {
    // 重置位置
    this.player.setPosition(400, 300);
    this.enemy.setPosition(100, 100);
    this.player.clearTint();

    // 重置状态
    this.isCaught = false;
    this.statusText.setStyle({ fill: '#00ff00' });
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

new Phaser.Game(config);