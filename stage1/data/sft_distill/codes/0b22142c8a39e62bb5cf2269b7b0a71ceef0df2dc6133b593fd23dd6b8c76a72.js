class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 200;
    this.enemySpeed = 120;
    this.detectionRange = 150; // 敌人检测玩家的距离
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.patrolDistance = 200; // 巡逻距离
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（白色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建10个敌人，分布在不同位置
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 150;
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 为每个敌人添加自定义属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 巡逻相关属性
      enemy.patrolStartX = x;
      enemy.patrolDirection = i % 2 === 0 ? 1 : -1; // 交替初始方向
      enemy.isChasing = false;
      
      // 设置初始速度
      enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 添加玩家与敌人的碰撞检测（可选）
    this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);
  }

  update(time, delta) {
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

    // 更新每个敌人的行为
    this.enemiesChasing = 0;
    
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 检测玩家是否在检测范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置速度朝向玩家
        enemy.setVelocity(
          Math.cos(angle) * this.enemySpeed,
          Math.sin(angle) * this.enemySpeed
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff6666);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.setVelocityY(0);
        }

        // 恢复白色
        enemy.clearTint();

        // 巡逻逻辑：在起始点左右移动
        const distanceFromStart = enemy.x - enemy.patrolStartX;

        // 到达巡逻边界时反转方向
        if (Math.abs(distanceFromStart) > this.patrolDistance) {
          enemy.patrolDirection *= -1;
        }

        // 设置巡逻速度
        enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Enemies Chasing: ${this.enemiesChasing}/10`,
      `Detection Range: ${this.detectionRange}px`,
      'Use Arrow Keys to Move'
    ]);
  }

  handleCollision(player, enemy) {
    // 碰撞处理（可选实现）
    // 这里可以添加生命值减少等逻辑
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