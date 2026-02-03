// Phaser3 追踪镜头与震屏效果实现
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 100; // 可验证的状态信号
    this.collisionCount = 0; // 碰撞次数统计
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4a90e2, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xe74c3c, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x95a5a6, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 1600, 600);

    // 创建地面
    const ground = this.physics.add.staticSprite(800, 575, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.body.setGravity(0, 300);

    // 创建敌人（多个敌人增加碰撞机会）
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(200 + i * 400, 200, 'enemy');
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      enemy.setVelocity(
        Phaser.Math.Between(-200, 200),
        Phaser.Math.Between(-200, 200)
      );
      enemy.body.setGravity(0, 300);
    }

    // 设置碰撞
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.enemies, ground);
    this.physics.add.collider(this.enemies, this.enemies);

    // 玩家与敌人碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 摄像机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 600);

    // 创建UI文本（固定在屏幕上）
    this.healthText = this.add.text(16, 16, `Health: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在屏幕上不随摄像机移动

    this.collisionText = this.add.text(16, 50, `Collisions: ${this.collisionCount}`, {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);

    this.statusText = this.add.text(16, 84, 'Status: Normal', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 提示文本
    this.add.text(400, 50, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0);

    // 碰撞冷却标志
    this.canTakeDamage = true;
  }

  handleCollision(player, enemy) {
    // 冷却机制，避免频繁触发
    if (!this.canTakeDamage) return;

    this.canTakeDamage = false;
    this.collisionCount++;

    // 扣减生命值
    this.playerHealth -= 10;
    if (this.playerHealth < 0) this.playerHealth = 0;

    // 更新UI
    this.healthText.setText(`Health: ${this.playerHealth}`);
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
    this.statusText.setText('Status: DAMAGED!');
    this.statusText.setStyle({ fill: '#ff0000' });

    // 触发摄像机震动 3 秒
    // shake(duration, intensity)
    this.cameras.main.shake(3000, 0.01);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300 - 100
    );

    // 3秒后恢复状态
    this.time.delayedCall(3000, () => {
      this.canTakeDamage = true;
      this.statusText.setText('Status: Normal');
      this.statusText.setStyle({ fill: '#00ff00' });
    });

    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.statusText.setText('Status: GAME OVER');
      this.statusText.setStyle({ fill: '#ff0000', fontSize: '24px' });
      this.physics.pause();
    }
  }

  update() {
    if (this.playerHealth <= 0) return;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 确保敌人保持移动
    this.enemies.children.entries.forEach(enemy => {
      if (Math.abs(enemy.body.velocity.x) < 50) {
        enemy.setVelocityX(Phaser.Math.Between(-200, 200));
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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