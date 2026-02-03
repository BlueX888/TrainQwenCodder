class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.isShaking = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 设置世界边界（扩大世界以便摄像机追踪）
    this.physics.world.setBounds(0, 0, 2400, 600);

    // 创建地面平台
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground');
    platforms.create(1200, 568, 'ground');
    platforms.create(2000, 568, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建多个敌人
    const enemyPositions = [
      { x: 400, y: 450 },
      { x: 800, y: 450 },
      { x: 1200, y: 450 },
      { x: 1600, y: 450 },
      { x: 2000, y: 450 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setBounce(0.5);
      enemy.setCollideWorldBounds(true);
      // 给敌人随机速度
      enemy.setVelocityX(Phaser.Math.Between(-100, 100));
    });

    // 添加物理碰撞
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);

    // 添加玩家与敌人的碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 设置摄像机追踪玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2400, 600);

    // 创建生命值显示（固定在屏幕上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在屏幕上不随摄像机移动

    // 创建状态提示文本
    this.statusText = this.add.text(16, 60, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleCollision(player, enemy) {
    // 如果正在震屏，避免重复触发
    if (this.isShaking) {
      return;
    }

    // 扣减生命值
    this.health -= 10;
    this.health = Math.max(0, this.health); // 确保不低于0

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发摄像机震屏效果（持续3秒）
    this.isShaking = true;
    this.cameras.main.shake(3000, 0.01); // 3000ms，强度0.01

    // 更新状态提示
    this.statusText.setText('Collision! Camera Shaking...');
    this.statusText.setStyle({ fill: '#ff0000' });

    // 让敌人反弹
    enemy.setVelocityX(-enemy.body.velocity.x);
    enemy.setVelocityY(-200);

    // 让玩家反弹
    if (player.x < enemy.x) {
      player.setVelocityX(-200);
    } else {
      player.setVelocityX(200);
    }

    // 3秒后重置震屏状态
    this.time.delayedCall(3000, () => {
      this.isShaking = false;
      this.statusText.setText('Use Arrow Keys to Move');
      this.statusText.setStyle({ fill: '#fff' });
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Game Over! Health: 0');
      this.statusText.setStyle({ fill: '#ff0000', fontSize: '28px' });
      this.physics.pause();
      this.player.setTint(0xff0000);
    }
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 让敌人在边界反弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.body.velocity.x === 0) {
        enemy.setVelocityX(Phaser.Math.Between(-100, 100));
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);