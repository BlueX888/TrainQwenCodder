// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesRemaining = 0;
    this.player = null;
    this.enemies = null;
    this.levelText = null;
    this.enemyCountText = null;
    this.cursors = null;
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
    enemyGraphics.fillStyle(0x9932cc, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量：10 + 2 * (level - 1)
    const enemyCount = 10 + 2 * (this.currentLevel - 1);
    this.enemiesRemaining = enemyCount;

    // 生成敌人（使用固定种子保证确定性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 使用伪随机确保可重现性
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 200) - 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新 UI
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  hitEnemy(player, enemy) {
    // 销毁敌人
    enemy.destroy();
    this.enemiesRemaining--;

    // 更新 UI
    this.updateUI();

    // 检查是否清空所有敌人
    if (this.enemiesRemaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.showVictory();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });

      // 显示关卡完成提示
      const completeText = this.add.text(400, 300, 'Level Complete!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      });
      completeText.setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        completeText.destroy();
      });
    }
  }

  showVictory() {
    // 停止所有敌人
    this.enemies.clear(true, true);

    // 显示胜利信息
    const victoryText = this.add.text(400, 300, 'YOU WIN!\nAll 5 Levels Complete!', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    victoryText.setOrigin(0.5);

    // 显示统计信息
    const statsText = this.add.text(400, 400, 'Total Enemies Defeated: 50', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    statsText.setOrigin(0.5);
  }

  update(time, delta) {
    if (!this.player || !this.player.active) {
      return;
    }

    // 玩家移动控制
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);