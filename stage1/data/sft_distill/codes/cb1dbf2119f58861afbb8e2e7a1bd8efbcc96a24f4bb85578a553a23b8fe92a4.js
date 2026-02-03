class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.collisionCount = 0;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（绿色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(432, 432);

    // 创建敌人（随机位置）
    const spawnX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const spawnY = Phaser.Math.Between(0, 1) === 0 ? 50 : 550;
    this.enemy = this.physics.add.sprite(spawnX, spawnY, 'enemy');
    this.enemy.setMaxVelocity(360, 360);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏提示
    this.add.text(400, 50, '使用方向键或WASD移动，躲避灰色敌人！', {
      fontSize: '20px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 初始化计时器
    this.startTime = this.time.now;
  }

  handleCollision(player, enemy) {
    if (!this.isGameOver) {
      this.collisionCount++;
      
      // 碰撞后将敌人推开
      const angle = Phaser.Math.Angle.Between(
        player.x, player.y,
        enemy.x, enemy.y
      );
      enemy.x = player.x + Math.cos(angle) * 100;
      enemy.y = player.y + Math.sin(angle) * 100;

      // 闪烁效果
      this.cameras.main.shake(100, 0.005);
      player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        player.clearTint();
      });
    }
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);

    // 玩家移动控制
    const speed = 432;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 敌人追踪玩家
    const angle = Phaser.Math.Angle.Between(
      this.enemy.x, this.enemy.y,
      this.player.x, this.player.y
    );
    
    const enemySpeed = 360;
    this.enemy.setVelocity(
      Math.cos(angle) * enemySpeed,
      Math.sin(angle) * enemySpeed
    );

    // 计算玩家与敌人距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新状态文本
    this.statusText.setText([
      `存活时间: ${this.survivalTime}秒`,
      `碰撞次数: ${this.collisionCount}`,
      `距离敌人: ${Math.floor(distance)}px`,
      `玩家速度: 432 | 敌人速度: 360`
    ]);

    // 游戏结束条件（可选）
    if (this.collisionCount >= 10) {
      this.isGameOver = true;
      this.add.text(400, 300, 'GAME OVER\n碰撞次数过多！', {
        fontSize: '48px',
        fill: '#ff0000',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);
    }
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