class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.totalEnemies = 15;
    this.detectionRange = 200; // 检测范围
    this.patrolSpeed = 240;
    this.chaseSpeed = 300;
  }

  preload() {
    // 无需加载外部资源
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
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在不同位置
    for (let i = 0; i < this.totalEnemies; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = 100 + col * 150;
      const y = 100 + row * 150;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置巡逻数据
      enemy.setData('patrolLeft', x - 100);
      enemy.setData('patrolRight', x + 100);
      enemy.setData('isChasing', false);
      enemy.setData('patrolDirection', 1); // 1为右，-1为左
      
      // 初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.getData('patrolDirection'));
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加玩家与敌人的碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);
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
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 判断是否应该追踪
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.setData('isChasing', true);
        this.enemiesChasing++;
        
        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );
        
        enemy.setVelocity(
          Math.cos(angle) * this.chaseSpeed,
          Math.sin(angle) * this.chaseSpeed
        );
        
        // 改变颜色表示追踪状态
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        if (enemy.getData('isChasing')) {
          enemy.setData('isChasing', false);
          enemy.clearTint();
        }
        
        this.updatePatrol(enemy);
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Enemies Chasing: ${this.enemiesChasing}/${this.totalEnemies}\n` +
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `Use Arrow Keys to Move`
    );
  }

  updatePatrol(enemy) {
    const patrolLeft = enemy.getData('patrolLeft');
    const patrolRight = enemy.getData('patrolRight');
    let direction = enemy.getData('patrolDirection');

    // 检查是否到达巡逻边界
    if (enemy.x >= patrolRight && direction === 1) {
      direction = -1;
      enemy.setData('patrolDirection', direction);
    } else if (enemy.x <= patrolLeft && direction === -1) {
      direction = 1;
      enemy.setData('patrolDirection', direction);
    }

    // 设置巡逻速度
    enemy.setVelocityX(this.patrolSpeed * direction);
    enemy.setVelocityY(0);
  }

  handleCollision(player, enemy) {
    // 碰撞处理（可选：重置敌人位置或其他逻辑）
    // 这里仅作为示例，可以扩展
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