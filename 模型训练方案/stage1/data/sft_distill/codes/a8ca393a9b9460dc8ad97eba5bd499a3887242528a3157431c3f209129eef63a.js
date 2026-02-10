class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.detectionRadius = 200; // 检测半径
    this.patrolSpeed = 160; // 巡逻速度
    this.chaseSpeed = 200; // 追踪速度
    this.enemiesChasing = 0; // 正在追踪的敌人数量（状态信号）
    this.playerHealth = 100; // 玩家生命值（状态信号）
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150 },
      { x: 650, y: 300 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 初始化敌人状态
      enemy.setData('state', 'patrol'); // 状态：patrol 或 chase
      enemy.setData('direction', 1); // 巡逻方向：1(右) 或 -1(左)
      enemy.setData('patrolMinX', pos.x - 150); // 巡逻左边界
      enemy.setData('patrolMaxX', pos.x + 150); // 巡逻右边界
      
      // 设置初始速度
      enemy.setVelocityX(this.patrolSpeed * enemy.getData('direction'));
    });

    // 玩家与敌人碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(16, 560, '使用方向键移动玩家。敌人会巡逻，靠近时会追踪你！', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
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

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.detectionRadius) {
        // 切换到追踪模式
        enemy.setData('state', 'chase');
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle,
          this.chaseSpeed,
          enemy.body.velocity
        );

        // 视觉反馈：追踪时变亮
        enemy.setTint(0xff6666);
      } else {
        // 切换到巡逻模式
        if (enemy.getData('state') === 'chase') {
          enemy.setData('state', 'patrol');
          enemy.setVelocityY(0);
        }

        // 恢复原色
        enemy.clearTint();

        // 巡逻逻辑
        this.patrolEnemy(enemy);
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `玩家生命值: ${this.playerHealth}`,
      `追踪中的敌人: ${this.enemiesChasing}/3`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }

  patrolEnemy(enemy) {
    const direction = enemy.getData('direction');
    const minX = enemy.getData('patrolMinX');
    const maxX = enemy.getData('patrolMaxX');

    // 检查是否到达边界
    if (enemy.x <= minX && direction === -1) {
      enemy.setData('direction', 1);
      enemy.setVelocityX(this.patrolSpeed);
    } else if (enemy.x >= maxX && direction === 1) {
      enemy.setData('direction', -1);
      enemy.setVelocityX(-this.patrolSpeed);
    } else {
      // 保持当前方向移动
      enemy.setVelocityX(this.patrolSpeed * direction);
    }
  }

  hitEnemy(player, enemy) {
    // 玩家被敌人击中
    this.playerHealth -= 10;
    
    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.scene.pause();
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
    } else {
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      this.physics.velocityFromRotation(angle, 300, player.body.velocity);
      
      // 短暂无敌时间
      player.setAlpha(0.5);
      this.time.delayedCall(500, () => {
        player.setAlpha(1);
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