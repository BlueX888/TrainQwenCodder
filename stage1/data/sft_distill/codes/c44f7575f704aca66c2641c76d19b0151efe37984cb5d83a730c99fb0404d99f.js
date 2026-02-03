class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.canTakeDamage = true;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成5个敌人在随机位置
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 1500);
      const y = Phaser.Math.Between(100, 1100);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给敌人随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(-100, 100);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 添加碰撞检测
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 敌人之间也会碰撞
    this.physics.add.collider(this.enemies, this.enemies);

    // 设置镜头跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 1200);

    // 创建生命值文本（固定在镜头上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头视口

    // 创建提示文本
    this.hintText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.hintText.setScrollFactor(0);

    // 创建状态文本（显示碰撞信息）
    this.statusText = this.add.text(16, 80, '', {
      fontSize: '16px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.statusText.setScrollFactor(0);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleCollision(player, enemy) {
    // 避免短时间内多次扣血
    if (!this.canTakeDamage) {
      return;
    }

    this.canTakeDamage = false;

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) {
      this.health = 0;
    }

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发镜头震动 2.5 秒（2500 毫秒）
    this.cameras.main.shake(2500, 0.01);

    // 显示碰撞状态
    this.statusText.setText('Collision! Camera Shaking...');
    this.statusText.setStyle({ fill: '#ff0000' });

    // 震动结束后清除状态文本
    this.time.delayedCall(2500, () => {
      this.statusText.setText('');
      this.canTakeDamage = true;
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.healthText.setStyle({ fill: '#ff0000' });
      this.statusText.setText('Game Over!');
      this.statusText.setStyle({ fill: '#ff0000', fontSize: '24px' });
      this.physics.pause();
    }
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
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
new Phaser.Game(config);