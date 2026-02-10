class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.playerHealth = 100; // 状态信号：玩家生命值
    this.detectionRange = 150; // 敌人检测范围
    this.patrolSpeed = 120; // 巡逻速度
    this.chaseSpeed = 180; // 追踪速度
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成10个敌人，分布在场景中
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 300;
      const enemy = this.enemies.create(x, y, 'enemy');
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置敌人自定义数据
      enemy.setData('patrolDirection', Math.random() > 0.5 ? 1 : -1); // 随机初始方向
      enemy.setData('isChasing', false); // 是否正在追踪
      enemy.setData('patrolMinX', x - 100); // 巡逻左边界
      enemy.setData('patrolMaxX', x + 100); // 巡逻右边界
      
      // 设置初始速度
      enemy.setVelocityX(this.patrolSpeed * enemy.getData('patrolDirection'));
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测（敌人碰到玩家）
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // 添加状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界线用于调试
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.3);
    graphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 更新状态信号
    this.enemiesChasing = 0;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 更新每个敌人的行为
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 检测玩家是否在范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.getData('isChasing')) {
          enemy.setData('isChasing', true);
        }
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(angle, this.chaseSpeed, enemy.body.velocity);

      } else {
        // 巡逻模式
        if (enemy.getData('isChasing')) {
          enemy.setData('isChasing', false);
        }

        const patrolDirection = enemy.getData('patrolDirection');
        const patrolMinX = enemy.getData('patrolMinX');
        const patrolMaxX = enemy.getData('patrolMaxX');

        // 检查是否到达巡逻边界
        if (enemy.x <= patrolMinX && patrolDirection === -1) {
          enemy.setData('patrolDirection', 1);
          enemy.setVelocity(this.patrolSpeed, 0);
        } else if (enemy.x >= patrolMaxX && patrolDirection === 1) {
          enemy.setData('patrolDirection', -1);
          enemy.setVelocity(-this.patrolSpeed, 0);
        } else {
          // 保持巡逻速度（只在X轴移动）
          enemy.setVelocity(this.patrolSpeed * patrolDirection, 0);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Player Health: ${this.playerHealth}`,
      `Enemies Chasing: ${this.enemiesChasing}/10`,
      `Player Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Controls: WASD or Arrow Keys`
    ]);
  }

  hitPlayer(player, enemy) {
    // 玩家被敌人碰到，减少生命值
    this.playerHealth -= 1;
    
    // 敌人短暂后退
    const angle = Phaser.Math.Angle.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );
    this.physics.velocityFromRotation(angle, 150, enemy.body.velocity);

    // 玩家闪烁效果
    player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      player.clearTint();
    });

    // 游戏结束检测
    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.gameOver();
    }
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 370, 'Refresh to restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);
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