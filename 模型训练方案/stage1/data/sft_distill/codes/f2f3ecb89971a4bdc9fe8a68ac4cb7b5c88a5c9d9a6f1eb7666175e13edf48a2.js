class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 100;
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.detectionRange = 200; // 检测范围
    this.patrolSpeed = 160;
    this.chaseSpeed = 200;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150 },
      { x: 400, y: 200 },
      { x: 650, y: 150 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性
      enemy.isChasing = false;
      enemy.patrolDirection = 1; // 1为右，-1为左
      enemy.patrolMinX = pos.x - 150;
      enemy.patrolMaxX = pos.x + 150;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加碰撞检测（可选：玩家碰到敌人减血）
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
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

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        
        this.enemiesChasing++;

        // 向玩家移动
        this.physics.moveToObject(enemy, this.player, this.chaseSpeed);
        
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 巡逻边界检测
        if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.patrolSpeed);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Player Health: ${this.playerHealth}`,
      `Enemies Chasing: ${this.enemiesChasing}/3`,
      `Detection Range: ${this.detectionRange}px`,
      `Use Arrow Keys to Move`
    ]);
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人减血（每次碰撞间隔处理）
    if (!enemy.hitCooldown) {
      this.playerHealth = Math.max(0, this.playerHealth - 10);
      enemy.hitCooldown = true;
      
      // 击退效果
      this.physics.moveToObject(player, enemy, -300);
      
      // 冷却时间
      this.time.delayedCall(1000, () => {
        enemy.hitCooldown = false;
      });

      // 游戏结束检测
      if (this.playerHealth <= 0) {
        this.scene.restart();
      }
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