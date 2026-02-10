class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 20;
    this.enemyIncrement = 2;
    this.enemiesDestroyed = 0;
    this.totalEnemies = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建UI文本
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

    this.instructionText = this.add.text(400, 300, 'Press SPACE to shoot enemies!\nUse arrow keys to move', {
      fontSize: '18px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 启动第一关
    this.startLevel();

    // 添加射击功能
    this.bullets = this.physics.add.group();
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameCompleted = true;
      this.showVictory();
      return;
    }

    // 计算当前关卡敌人数量
    this.totalEnemies = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.enemiesDestroyed = 0;

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用确定性位置）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < this.totalEnemies; i++) {
      // 使用伪随机但确定性的位置
      const x = 50 + ((seed + i * 137) % 700);
      const y = 50 + ((seed + i * 211) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 150) - 75
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();

    // 隐藏说明文字
    if (this.instructionText && this.currentLevel > 1) {
      this.instructionText.setVisible(false);
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesDestroyed}/${this.totalEnemies}`);
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人，敌人被消灭
    enemy.destroy();
    this.enemiesDestroyed++;
    this.updateUI();
    this.checkLevelComplete();
  }

  bulletHitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.destroy();
    enemy.destroy();
    this.enemiesDestroyed++;
    this.updateUI();
    this.checkLevelComplete();
  }

  checkLevelComplete() {
    if (this.enemiesDestroyed >= this.totalEnemies) {
      // 关卡完成
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });

      // 显示关卡完成提示
      const completeText = this.add.text(400, 300, 'Level Complete!', {
        fontSize: '32px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        completeText.destroy();
      });
    }
  }

  showVictory() {
    // 清空所有游戏对象
    this.enemies.clear(true, true);
    if (this.bullets) {
      this.bullets.clear(true, true);
    }
    this.player.setVisible(false);

    // 显示胜利信息
    this.add.text(400, 300, 'VICTORY!\nAll 5 Levels Completed!', {
      fontSize: '48px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 30, y: 20 },
      align: 'center'
    }).setOrigin(0.5);

    const statsText = `Total Enemies Defeated: ${this.baseEnemyCount * 5 + this.enemyIncrement * 10}`;
    this.add.text(400, 400, statsText, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return;
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击控制（防止连续发射）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }
  }

  shootBullet() {
    const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
    bullet.setVelocityY(-400);

    // 子弹离开屏幕后销毁
    this.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 可验证状态（通过场景访问）
// game.scene.scenes[0].currentLevel - 当前关卡
// game.scene.scenes[0].enemiesDestroyed - 已消灭敌人数
// game.scene.scenes[0].totalEnemies - 当前关卡总敌人数
// game.scene.scenes[0].gameCompleted - 游戏是否完成