class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.health = 100;
    this.enemiesTrackingCount = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建12个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 700, y: 100 },
      { x: 100, y: 250 }, { x: 300, y: 250 }, { x: 500, y: 250 }, { x: 700, y: 250 },
      { x: 100, y: 400 }, { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 为每个敌人添加自定义属性
      enemy.patrolSpeed = 120;
      enemy.trackingSpeed = 180;
      enemy.detectionRange = 150; // 检测范围
      enemy.isTracking = false;
      
      // 设置初始巡逻方向（奇数向右，偶数向左）
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      
      // 设置巡逻边界（每个敌人有自己的巡逻区域）
      enemy.patrolLeft = pos.x - 100;
      enemy.patrolRight = pos.x + 100;
    });

    // 添加玩家与敌人的碰撞
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本显示状态
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.trackingText = this.add.text(16, 46, `Enemies Tracking: ${this.enemiesTrackingCount}`, {
      fontSize: '20px',
      fill: '#ffff00'
    });

    this.scoreText = this.add.text(16, 76, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加游戏说明
    this.add.text(400, 16, 'Use Arrow Keys to Move. Avoid Red Enemies!', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5, 0);

    // 碰撞冷却时间
    this.lastHitTime = 0;
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 更新敌人行为
    let trackingCount = 0;
    
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否进入追踪模式
      if (distance < enemy.detectionRange) {
        enemy.isTracking = true;
        trackingCount++;
        
        // 追踪玩家
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        enemy.setVelocity(
          Math.cos(angle) * enemy.trackingSpeed,
          Math.sin(angle) * enemy.trackingSpeed
        );
        
        // 改变颜色表示追踪状态
        enemy.setTint(0xff6666);
      } else {
        // 巡逻模式
        if (enemy.isTracking) {
          // 从追踪模式切换回巡逻模式
          enemy.isTracking = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
          enemy.clearTint();
        }
        
        // 检查巡逻边界并反向
        if (enemy.x <= enemy.patrolLeft && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= enemy.patrolRight && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新追踪计数
    this.enemiesTrackingCount = trackingCount;
    this.trackingText.setText(`Enemies Tracking: ${this.enemiesTrackingCount}`);

    // 增加生存分数
    if (time % 100 < delta) {
      this.score += 1;
      this.scoreText.setText(`Score: ${this.score}`);
    }

    // 检查游戏结束
    if (this.health <= 0) {
      this.scene.restart();
      this.health = 100;
      this.score = 0;
    }
  }

  hitEnemy(player, enemy) {
    const currentTime = this.time.now;
    
    // 碰撞冷却（每秒最多受伤一次）
    if (currentTime - this.lastHitTime > 1000) {
      this.health -= 10;
      this.healthText.setText(`Health: ${this.health}`);
      this.lastHitTime = currentTime;
      
      // 视觉反馈
      this.cameras.main.shake(200, 0.01);
      player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        player.clearTint();
      });
    }
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