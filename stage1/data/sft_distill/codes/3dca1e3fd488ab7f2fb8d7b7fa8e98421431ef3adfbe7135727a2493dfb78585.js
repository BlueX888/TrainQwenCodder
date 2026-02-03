class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.patrolSpeed = 80;
    this.chaseSpeed = 120;
    this.detectionRange = 150;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      enemies: [],
      frameCount: 0
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成5个敌人，分布在不同位置
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 150 },
      { x: 200, y: 400 },
      { x: 600, y: 450 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 为每个敌人设置自定义属性
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替初始方向
      enemy.isChasing = false;
      enemy.patrolMinX = pos.x - 100;
      enemy.patrolMaxX = pos.x + 100;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 添加碰撞检测（玩家与敌人）
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys: Move Player\nEnemies chase when close (<150px)', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 560, '', {
      fontSize: '12px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 玩家移动控制
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 更新玩家位置到signals
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 更新敌人行为
    let chasingCount = 0;
    window.__signals__.enemies = [];

    this.enemies.children.entries.forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 判断是否在检测范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        chasingCount++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(angle, this.chaseSpeed, enemy.body.velocity);
      } else {
        // 巡逻模式
        enemy.isChasing = false;

        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolMinX) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }

        // 保持Y轴速度为0（水平巡逻）
        if (Math.abs(enemy.body.velocity.y) > 0) {
          enemy.setVelocityY(0);
        }
      }

      // 记录敌人状态到signals
      window.__signals__.enemies.push({
        index: index,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        state: enemy.isChasing ? 'chasing' : 'patrolling',
        distance: Math.round(distance),
        velocityX: Math.round(enemy.body.velocity.x),
        velocityY: Math.round(enemy.body.velocity.y)
      });
    });

    // 更新状态文本
    this.statusText.setText(
      `Enemies Chasing: ${chasingCount}/5 | Frame: ${window.__signals__.frameCount}`
    );

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        player: window.__signals__.playerPosition,
        enemiesChasing: chasingCount,
        enemyStates: window.__signals__.enemies.map(e => ({
          index: e.index,
          state: e.state,
          distance: e.distance
        }))
      }));
    }
  }

  handleCollision(player, enemy) {
    // 碰撞处理（可扩展为游戏结束等逻辑）
    console.log('Player hit by enemy!');
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