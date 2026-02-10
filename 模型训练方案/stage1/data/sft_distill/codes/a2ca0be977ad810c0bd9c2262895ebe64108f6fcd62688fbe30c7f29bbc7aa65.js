class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 10;
    this.enemyIncrement = 2;
    this.totalEnemies = 0;
    this.remainingEnemies = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    // 计算当前关卡敌人数量
    this.totalEnemies = this.enemiesPerLevel + (level - 1) * this.enemyIncrement;
    this.remainingEnemies = this.totalEnemies;

    // 更新UI
    this.updateUI();

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子保证确定性）
    const seed = level * 1000;
    for (let i = 0; i < this.totalEnemies; i++) {
      // 使用伪随机保证确定性
      const x = 50 + ((seed + i * 37) % 700);
      const y = 50 + ((seed + i * 73) % 250);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 17) % 100) - 50,
        ((seed + i * 23) % 100) - 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 重置玩家位置
    this.player.setPosition(400, 500);
    this.player.setVelocity(0, 0);

    // 显示关卡开始提示
    this.statusText.setText(`Level ${level} Start!`);
    this.statusText.setVisible(true);
    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
    });
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.totalEnemies}`);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否通关
    if (this.remainingEnemies <= 0) {
      this.levelComplete();
    }
  }

  hitPlayer(player, enemy) {
    // 游戏结束
    this.physics.pause();
    this.statusText.setText('Game Over!');
    this.statusText.setVisible(true);
    
    // 3秒后重新开始
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 全部通关
      this.physics.pause();
      this.statusText.setText('All Levels Complete!');
      this.statusText.setVisible(true);
      
      // 5秒后重新开始
      this.time.delayedCall(5000, () => {
        this.scene.restart();
      });
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(1500, () => {
        this.startLevel(this.currentLevel);
      });
    }
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹出界自动销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return;
    }

    // 玩家移动
    const speed = 300;
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

    // 发射子弹（限制射速）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理出界子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < 0 || bullet.y > 600) {
        bullet.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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