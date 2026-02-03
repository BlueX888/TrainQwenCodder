class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.detectionRange = 150; // 检测范围
    this.loseTrackRange = 200; // 失去追踪范围
    this.patrolSpeed = 300; // 巡逻速度
    this.chaseSpeed = 350; // 追踪速度
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 添加背景文字说明
    this.add.text(10, 10, 'Arrow Keys to Move', { 
      fontSize: '16px', 
      color: '#ffffff' 
    });
    
    this.add.text(10, 30, 'Enemies chase when close!', { 
      fontSize: '16px', 
      color: '#ff69b4' 
    });

    // 状态显示文本
    this.statusText = this.add.text(10, 560, '', { 
      fontSize: '18px', 
      color: '#ffff00' 
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，设置不同的巡逻区域
    const enemyConfigs = [
      { x: 150, y: 150, minX: 50, maxX: 350 },
      { x: 400, y: 400, minX: 250, maxX: 550 },
      { x: 650, y: 250, minX: 500, maxX: 750 }
    ];

    enemyConfigs.forEach(config => {
      const enemy = this.enemies.create(config.x, config.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 自定义属性：巡逻状态
      enemy.patrolMinX = config.minX;
      enemy.patrolMaxX = config.maxX;
      enemy.patrolDirection = 1; // 1为右，-1为左
      enemy.isChasing = false; // 是否在追踪状态
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试信息
    console.log('Game created: 3 enemies patrolling');
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

      // 检测是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 进入追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
          console.log('Enemy started chasing!');
        }
        
        this.enemiesChasing++;
        this.chasePlayer(enemy);
        
      } else if (distance > this.loseTrackRange && enemy.isChasing) {
        // 失去追踪，恢复巡逻
        enemy.isChasing = false;
        console.log('Enemy lost track, back to patrol');
      }

      // 巡逻模式
      if (!enemy.isChasing) {
        this.patrolEnemy(enemy);
      }
    });

    // 更新状态显示
    this.statusText.setText(`Enemies Chasing: ${this.enemiesChasing}/3`);
  }

  patrolEnemy(enemy) {
    // 检查是否到达巡逻边界
    if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
      enemy.patrolDirection = -1;
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    } else if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
      enemy.patrolDirection = 1;
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    }

    // 保持Y轴速度为0（只左右移动）
    enemy.setVelocityY(0);
  }

  chasePlayer(enemy) {
    // 计算朝向玩家的方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    );

    // 设置追踪速度
    const velocityX = Math.cos(angle) * this.chaseSpeed;
    const velocityY = Math.sin(angle) * this.chaseSpeed;

    enemy.setVelocity(velocityX, velocityY);
  }
}

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

new Phaser.Game(config);