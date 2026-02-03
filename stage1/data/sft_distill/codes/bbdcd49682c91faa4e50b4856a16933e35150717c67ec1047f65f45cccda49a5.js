class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyStates = {}; // 追踪每个敌人的状态
    this.chaseCount = 0; // 正在追踪的敌人数量
  }

  preload() {
    // 使用Graphics创建纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x888888, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，设置不同的初始位置和巡逻范围
    const enemyConfigs = [
      { x: 150, y: 150, minX: 50, maxX: 350 },
      { x: 400, y: 250, minX: 250, maxX: 550 },
      { x: 650, y: 150, minX: 450, maxX: 750 }
    ];

    enemyConfigs.forEach((config, index) => {
      const enemy = this.enemies.create(config.x, config.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(28, 28);
      
      // 存储敌人的巡逻配置
      enemy.patrolMinX = config.minX;
      enemy.patrolMaxX = config.maxX;
      enemy.patrolSpeed = 160;
      enemy.chaseSpeed = 200;
      enemy.chaseDistance = 150; // 追踪距离阈值
      enemy.returnDistance = 250; // 返回巡逻距离阈值
      
      // 初始化为向右移动
      enemy.setVelocityX(enemy.patrolSpeed);
      
      // 初始化状态
      this.enemyStates[index] = 'patrol';
    });

    // 添加碰撞检测（可选：玩家与敌人碰撞）
    this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 560, '使用方向键移动 | 靠近敌人触发追踪', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家移动控制
    this.handlePlayerMovement();

    // 更新每个敌人的行为
    this.chaseCount = 0;
    this.enemies.children.entries.forEach((enemy, index) => {
      this.updateEnemyBehavior(enemy, index);
    });

    // 更新状态显示
    this.updateStatusDisplay();
  }

  handlePlayerMovement() {
    const speed = 200;
    
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  updateEnemyBehavior(enemy, index) {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    );

    const currentState = this.enemyStates[index];

    // 状态切换逻辑
    if (currentState === 'patrol' && distanceToPlayer < enemy.chaseDistance) {
      // 切换到追踪模式
      this.enemyStates[index] = 'chase';
      this.chaseCount++;
    } else if (currentState === 'chase' && distanceToPlayer > enemy.returnDistance) {
      // 切换回巡逻模式
      this.enemyStates[index] = 'patrol';
      // 恢复巡逻速度方向
      if (enemy.x < (enemy.patrolMinX + enemy.patrolMaxX) / 2) {
        enemy.setVelocityX(enemy.patrolSpeed);
      } else {
        enemy.setVelocityX(-enemy.patrolSpeed);
      }
      enemy.setVelocityY(0);
    } else if (currentState === 'chase') {
      this.chaseCount++;
    }

    // 执行对应状态的行为
    if (this.enemyStates[index] === 'patrol') {
      this.patrolBehavior(enemy);
    } else if (this.enemyStates[index] === 'chase') {
      this.chaseBehavior(enemy);
    }
  }

  patrolBehavior(enemy) {
    // 保持Y轴速度为0
    enemy.setVelocityY(0);

    // 检测巡逻边界并反转方向
    if (enemy.x <= enemy.patrolMinX && enemy.body.velocity.x < 0) {
      enemy.setVelocityX(enemy.patrolSpeed);
    } else if (enemy.x >= enemy.patrolMaxX && enemy.body.velocity.x > 0) {
      enemy.setVelocityX(-enemy.patrolSpeed);
    }
  }

  chaseBehavior(enemy) {
    // 计算朝向玩家的方向向量
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    );

    // 设置朝向玩家的速度
    const velocityX = Math.cos(angle) * enemy.chaseSpeed;
    const velocityY = Math.sin(angle) * enemy.chaseSpeed;
    
    enemy.setVelocity(velocityX, velocityY);
  }

  handleCollision(player, enemy) {
    // 碰撞处理（可选实现：游戏结束、扣血等）
    // 这里简单地让敌人反弹
    enemy.setVelocity(-enemy.body.velocity.x, -enemy.body.velocity.y);
  }

  updateStatusDisplay() {
    const patrolCount = 3 - this.chaseCount;
    this.statusText.setText([
      `巡逻中: ${patrolCount}`,
      `追踪中: ${this.chaseCount}`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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