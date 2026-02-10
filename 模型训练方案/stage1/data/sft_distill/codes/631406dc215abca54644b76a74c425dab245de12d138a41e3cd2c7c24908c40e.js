// 确定性生成橙色障碍物布局
const SEED = 12345; // 固定种子，修改此值会生成不同布局

class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.obstacleCount = 0;
    this.obstaclePositions = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置确定性随机种子
    this.game.config.seed = [SEED.toString()];
    Phaser.Math.RND.sow([SEED.toString()]);

    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${SEED}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 显示障碍物数量
    this.countText = this.add.text(10, 50, `Obstacles: 0/8`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setDepth(100);

    // 设置游戏区域边界（留出边距）
    const margin = 80;
    const minX = margin;
    const maxX = 800 - margin;
    const minY = 100;
    const maxY = 600 - margin;

    // 生成 8 个橙色障碍物
    const obstacles = [];
    const minDistance = 100; // 障碍物之间最小距离，避免重叠

    for (let i = 0; i < 8; i++) {
      let x, y, width, height, valid;
      let attempts = 0;
      const maxAttempts = 100;

      // 尝试找到不重叠的位置
      do {
        valid = true;
        x = Phaser.Math.RND.between(minX, maxX);
        y = Phaser.Math.RND.between(minY, maxY);
        
        // 随机选择障碍物类型和大小
        const type = Phaser.Math.RND.between(0, 1); // 0: 矩形, 1: 圆形
        
        if (type === 0) {
          width = Phaser.Math.RND.between(40, 80);
          height = Phaser.Math.RND.between(40, 80);
        } else {
          width = Phaser.Math.RND.between(20, 40); // 圆形半径
          height = width; // 圆形用 width 作为半径
        }

        // 检查与已有障碍物的距离
        for (let j = 0; j < obstacles.length; j++) {
          const dist = Phaser.Math.Distance.Between(x, y, obstacles[j].x, obstacles[j].y);
          if (dist < minDistance) {
            valid = false;
            break;
          }
        }

        attempts++;
        if (attempts > maxAttempts) {
          // 如果尝试太多次，降低距离要求
          valid = true;
        }
      } while (!valid);

      // 创建障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFF8C00, 1); // 橙色 (Dark Orange)
      graphics.lineStyle(3, 0xFF6600, 1); // 深橙色边框

      const obstacleType = i % 2 === 0 ? 'rect' : 'circle';
      
      if (obstacleType === 'rect') {
        // 绘制矩形障碍物
        graphics.fillRect(x - width / 2, y - height / 2, width, height);
        graphics.strokeRect(x - width / 2, y - height / 2, width, height);
      } else {
        // 绘制圆形障碍物
        graphics.fillCircle(x, y, width);
        graphics.strokeCircle(x, y, width);
      }

      // 添加障碍物编号
      const label = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      label.setDepth(10);

      // 记录障碍物信息
      obstacles.push({
        x: x,
        y: y,
        width: width,
        height: height,
        type: obstacleType,
        graphics: graphics,
        label: label
      });

      this.obstaclePositions.push({ x, y, width, height, type: obstacleType });
      this.obstacleCount++;
    }

    // 更新障碍物数量显示
    this.countText.setText(`Obstacles: ${this.obstacleCount}/8`);

    // 添加说明文本
    const infoText = this.add.text(400, 570, 'Change SEED constant to generate different layouts', {
      fontSize: '16px',
      color: '#cccccc',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    infoText.setOrigin(0.5);

    // 显示位置信息（用于验证确定性）
    const posInfo = this.add.text(10, 90, this.getPositionSummary(), {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    posInfo.setDepth(100);

    // 添加重新生成按钮（使用相同 seed）
    const regenButton = this.add.text(650, 10, 'Regenerate', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#0066cc',
      padding: { x: 10, y: 5 }
    });
    regenButton.setInteractive({ useHandCursor: true });
    regenButton.on('pointerdown', () => {
      this.scene.restart();
    });
    regenButton.on('pointerover', () => {
      regenButton.setBackgroundColor('#0088ff');
    });
    regenButton.on('pointerout', () => {
      regenButton.setBackgroundColor('#0066cc');
    });

    console.log('Obstacle layout generated with seed:', SEED);
    console.log('Obstacle positions:', this.obstaclePositions);
  }

  getPositionSummary() {
    // 生成位置摘要（前3个障碍物的坐标）用于快速验证
    let summary = 'First 3 positions:\n';
    for (let i = 0; i < Math.min(3, this.obstaclePositions.length); i++) {
      const pos = this.obstaclePositions[i];
      summary += `${i + 1}: (${Math.round(pos.x)}, ${Math.round(pos.y)})\n`;
    }
    return summary;
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: [SEED.toString()], // 设置全局种子
  scene: ObstacleScene
};

// 创建游戏实例
const game = new Phaser.Game(config);