// 完整的 Phaser3 代码 - 追踪镜头与震屏效果
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.canTakeDamage = true;
    this.collisionCount = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      health: this.health,
      collisions: [],
      shakeEvents: [],
      gameState: 'running'
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x888888, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 添加地面
    const ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(300 + i * 200, 200 + i * 100, 'enemy');
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.enemies, ground);
    this.physics.add.collider(this.enemies, this.enemies);

    // 玩家与敌人碰撞
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 设置相机跟随玩家（追踪镜头）
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, 800, 600);

    // 创建生命值显示（固定在屏幕左上角）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在屏幕上，不随相机移动

    // 创建提示文本
    this.infoText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    this.infoText.setScrollFactor(0);

    // 创建碰撞提示文本
    this.collisionText = this.add.text(400, 100, '', {
      fontSize: '20px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setOrigin(0.5);
    this.collisionText.setScrollFactor(0);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    console.log('[Game] Scene created, health:', this.health);
  }

  handleCollision(player, enemy) {
    // 防止连续碰撞造成多次伤害
    if (!this.canTakeDamage) return;

    this.canTakeDamage = false;
    this.collisionCount++;

    // 扣减生命值
    const damage = 10;
    this.health -= damage;
    if (this.health < 0) this.health = 0;

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发相机震动 2 秒
    this.cameras.main.shake(2000, 0.01);

    // 显示碰撞提示
    this.collisionText.setText(`-${damage} HP! Collision!`);
    this.time.delayedCall(1000, () => {
      this.collisionText.setText('');
    });

    // 记录信号
    const collisionData = {
      timestamp: Date.now(),
      collisionNumber: this.collisionCount,
      healthBefore: this.health + damage,
      healthAfter: this.health,
      damage: damage,
      playerPos: { x: player.x, y: player.y },
      enemyPos: { x: enemy.x, y: enemy.y }
    };

    window.__signals__.collisions.push(collisionData);
    window.__signals__.shakeEvents.push({
      timestamp: Date.now(),
      duration: 2000,
      intensity: 0.01
    });
    window.__signals__.health = this.health;

    console.log('[Collision]', JSON.stringify(collisionData));

    // 检查游戏结束
    if (this.health <= 0) {
      window.__signals__.gameState = 'gameOver';
      this.collisionText.setText('GAME OVER!');
      this.collisionText.setStyle({ fontSize: '32px', fill: '#ff0000' });
      this.physics.pause();
      console.log('[Game] Game Over! Total collisions:', this.collisionCount);
    }

    // 玩家击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);

    // 1秒后可以再次受伤
    this.time.delayedCall(1000, () => {
      this.canTakeDamage = true;
    });
  }

  update(time, delta) {
    if (this.health <= 0) return;

    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-300);
    }

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态
console.log('[Game] Started with config:', {
  width: config.width,
  height: config.height,
  physics: 'arcade',
  initialHealth: 100
});