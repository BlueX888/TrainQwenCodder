class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isShaking = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // 创建地面平台
    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 20; i++) {
      this.platforms.create(i * 64 + 32, 568, 'ground');
    }

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(400, 450, 'enemy');
    this.enemy.setBounce(0.2);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setVelocityX(100);

    // 添加物理碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemy, this.platforms);

    // 玩家与敌人碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置镜头跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1280, 600);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 1280, 600);

    // 创建生命值显示文本（固定在镜头上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头上

    // 创建震屏状态提示文本
    this.shakeText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.shakeText.setScrollFactor(0);

    // 添加背景网格以便观察震屏效果
    this.createBackground();
  }

  createBackground() {
    const bg = this.add.graphics();
    bg.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x < 1280; x += 50) {
      bg.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      bg.lineBetween(0, y, 1280, y);
    }
  }

  handleCollision(player, enemy) {
    // 避免重复触发
    if (this.isShaking) {
      return;
    }

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) {
      this.health = 0;
    }

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发镜头震动 3 秒（3000 毫秒）
    this.cameras.main.shake(3000, 0.01);

    // 设置震屏状态
    this.isShaking = true;
    this.shakeText.setText('Camera Shaking!');

    // 玩家击退效果
    if (player.x < enemy.x) {
      player.setVelocityX(-200);
    } else {
      player.setVelocityX(200);
    }

    // 3 秒后重置震屏状态
    this.time.delayedCall(3000, () => {
      this.isShaking = false;
      this.shakeText.setText('');
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.healthText.setText('Health: 0 - GAME OVER');
      this.physics.pause();
    }
  }

  update(time, delta) {
    // 玩家控制
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

    // 敌人简单AI：到达边界时反向
    if (this.enemy.body.velocity.x > 0 && this.enemy.x >= 1200) {
      this.enemy.setVelocityX(-100);
    } else if (this.enemy.body.velocity.x < 0 && this.enemy.x <= 80) {
      this.enemy.setVelocityX(100);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene,
  backgroundColor: '#1a1a1a'
};

// 创建游戏实例
const game = new Phaser.Game(config);