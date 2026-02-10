class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.playerHealth = 100; // 状态信号：玩家生命值
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成20个敌人，随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 自定义数据：巡逻方向和状态
      enemy.setData('patrolDirection', Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
      enemy.setData('state', 'patrol'); // patrol 或 chase
      enemy.setData('detectionRange', 150); // 检测范围
      
      // 设置初始巡逻速度
      const direction = enemy.getData('patrolDirection');
      enemy.setVelocityX(80 * direction);
    }

    // 添加玩家与敌人碰撞
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
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

    // 更新每个敌人的AI
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      const detectionRange = enemy.getData('detectionRange');

      if (distance < detectionRange) {
        // 玩家在检测范围内，切换到追踪模式
        enemy.setData('state', 'chase');
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度（80速度）
        enemy.setVelocity(
          Math.cos(angle) * 80,
          Math.sin(angle) * 80
        );

        // 改变颜色表示追踪状态
        enemy.setTint(0xff8800);
      } else {
        // 玩家不在范围内，切换到巡逻模式
        if (enemy.getData('state') === 'chase') {
          enemy.setData('state', 'patrol');
          enemy.clearTint();
          
          // 恢复巡逻速度
          const direction = enemy.getData('patrolDirection');
          enemy.setVelocityX(80 * direction);
          enemy.setVelocityY(0);
        }

        // 巡逻模式：检测边界并反向
        if (enemy.getData('state') === 'patrol') {
          // 左右边界检测
          if (enemy.x <= 12 || enemy.x >= 788) {
            const newDirection = enemy.getData('patrolDirection') * -1;
            enemy.setData('patrolDirection', newDirection);
            enemy.setVelocityX(80 * newDirection);
          }

          // 确保y轴速度为0（纯左右巡逻）
          if (Math.abs(enemy.body.velocity.y) > 0) {
            enemy.setVelocityY(0);
          }
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Health: ${this.playerHealth}`,
      `Enemies Chasing: ${this.enemiesChasing}/20`,
      `Use Arrow Keys to Move`
    ]);
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人，扣血
    this.playerHealth -= 1;
    
    // 敌人反弹
    this.physics.moveToObject(enemy, player, -100);
    
    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.scene.pause();
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000'
      }).setOrigin(0.5);
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